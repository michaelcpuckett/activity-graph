import { Db, MongoClient } from 'mongodb';
import * as firebaseAdmin from 'firebase-admin';
import { AppOptions } from 'firebase-admin';
import * as crypto from 'crypto';

import { APActivity, APCollection, APOrderedCollection } from '../classes/activity_pub';
import serviceAccount from '../../credentials';
import { getCollectionNameByUrl } from '../utilities/getCollectionNameByUrl';
import * as AP from '../types/activity_pub';
import { ACCEPT_HEADER, ACTIVITYSTREAMS_CONTENT_TYPE, CONTENT_TYPE_HEADER, CONTEXT, LOCAL_HOSTNAME, PUBLIC_ACTOR } from '../globals';
import { dbName } from '../../config';
import { getTypedThing } from '../utilities/getTypedThing';

export class Graph {
  db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  static async connect() {
    const client = new MongoClient("mongodb://testing:testing@localhost:27017");
    await client.connect();
    const db = client.db(dbName);
    return new Graph(db);
  }

  // Find.

  public async findOne(collection: string, matchingObject: Object): Promise<AP.AnyThing|null> {
    const value = await this.db.collection(collection).findOne(matchingObject);

    if (!value) {
      return value;
    }

    const {
      _id,
      ...one
    } = JSON.parse(JSON.stringify(value));

    return one;
  }

  public async findThingById(_id: string): Promise<AP.AnyThing|null> {
    const collectionName = getCollectionNameByUrl(_id);
    return await this.findOne(collectionName, { _id });
  }

  public async findStringValueById(dbCollection: string, _id: string): Promise<string> {
    const one = await this.db.collection(dbCollection).findOne({ _id });

    if (!one) {
      return '';
    }

    if (!('value' in one) || typeof one.value !== 'string') {
      return '';
    }

    return one.value;
  }

  public async findStringIdByValue(dbCollection: string, value: string): Promise<string> {
    const one = await this.db.collection(dbCollection).findOne({ value });

    if (!one) {
      return '';
    }

    if (!('_id' in one) || typeof one._id !== 'string') {
      return '';
    }

    return one._id;
  }
  
  async getAuthenticatedUserIdByToken(token: string): Promise<string|null> {
    if (!firebaseAdmin.apps.length) {
      const appOptions: AppOptions = {
        credential: firebaseAdmin.credential.cert(serviceAccount),
        projectId: "socialweb-id",
      };
  
      firebaseAdmin.initializeApp(appOptions);
    }
  
    const user = !token ? null : await firebaseAdmin.auth().verifyIdToken(token)
        .then(async (userCredential) => {
            return userCredential ?? null;
        })
        .catch((error) => {
            console.error(error);
            return null;
        });
  
    if (!user?.uid) {
      return null;
    }

    return user.uid;
  }

  async getActorByToken(token: string): Promise<AP.AnyActor|null> {
    const userId = await this.getAuthenticatedUserIdByToken(token);

    if (!userId) {
      return null;
    }

    const preferredUsername = await this.findStringValueById('username', userId);
    const user = await this.findOne('actor', { preferredUsername });

    if (user && 'preferredUsername' in user) {
      return user;
    }

    return null;
  }

  // Save.

  public async saveThing(thing: AP.AnyThing) {
    if (!thing.id) {
      throw new Error('No ID.');
    }

    const collectionName = getCollectionNameByUrl(thing.id);
    const _id = thing.id;

    return await this.db.collection(collectionName).replaceOne(
        {
          _id,
        },
        JSON.parse(JSON.stringify(thing)),
        {
          upsert: true,
        }
    );
  }

  public async saveString(dbCollection: string, _id: string, value: string) {
    return await this.db.collection(dbCollection).replaceOne(
        {
          _id,
        },
        JSON.parse(JSON.stringify({
          value
        })),
        {
          upsert: true,
        }
    );
  }

  // Insert/Remove

  async insertOrderedItem(path: string, url: string) {
    await this.db.collection('collection').updateOne({
      _id: path,
    }, {
      $inc: {
        totalItems: 1,
      },
      $push: {
        orderedItems: {
           $each: [url],
           $position: 0,
        }
      },
    }, {
      upsert: true,
    });
  }
  
  async removeOrderedItem(path: string, url: string) {
    await this.db.collection('collection').updateOne({
      _id: path
    }, {
      $inc: {
        totalItems: -1,
      },
      $pull: {
        orderedItems: url,
      },
    }, {
      upsert: true,
    });
  }

  async insertItem(path: string, url: string) {
    await this.db.collection('collection').updateOne({
      _id: path,
    }, {
      $inc: {
        totalItems: 1,
      },
      $push: {
        items: {
           $each: [url],
        }
      },
    }, {
      upsert: true,
    });
  }
  
  async removeItem(path: string, url: string) {
    await this.db.collection('collection').updateOne({
      _id: path
    }, {
      $inc: {
        totalItems: -1,
      },
      $pull: {
        items: url,
      },
    }, {
      upsert: true,
    });
  }

  // Fetch.

  async fetchThingById(id: string): Promise<AP.AnyThing|null> {
    // GET requests (eg. to the inbox) MUST be made with an Accept header of
    // `application/ld+json; profile="https://www.w3.org/ns/activitystreams"`
    const fetchedThing = await fetch(id, {
        headers: {
            [CONTENT_TYPE_HEADER]: ACTIVITYSTREAMS_CONTENT_TYPE,
            [ACCEPT_HEADER]: ACTIVITYSTREAMS_CONTENT_TYPE
        }
    })
    .then(async response => await response.json())
    .catch(error => {
      console.log(error);
      return null;
    });

    if (!(typeof fetchedThing === 'object' && fetchedThing && 'type' in fetchedThing)) {
      return null;
    }
    
    const thing = fetchedThing as AP.AnyThing;
    
    await this.saveThing(thing);

    console.log('SAVING...', thing.id);

    return fetchedThing;
  }

  async queryById(id: string): Promise<AP.AnyThing|null> {
    try {
      return await this.findThingById(id) ?? await this.fetchThingById(id);
    } catch (error: unknown) {
      throw new Error(String(error));
    }
  }

  // Other

  // TODO?
  
  async expandThing(thing: AP.AnyThing): Promise<AP.AnyThing> {
    const expanded = [];

    for (const [key, value] of Object.entries(thing)) {
      if (key === 'id' || key === 'url' || key === 'type' || key === CONTEXT) {
        expanded.push([key, value]);
      } else if (typeof value === 'string') {
        try {
          const url = new URL(value);
          expanded.push([key, await this.queryById(url.toString())]);
        } catch (error) {
          expanded.push([key, value]);
        }
      } else if (Array.isArray(value)) {
        const array = [...value];
        if (array.every((item: unknown) => typeof item === 'string')) {
          expanded.push([key, await Promise.all(array.map(async item => {
            if (typeof item === 'string') {
              try {
                const url = new URL(item);
                return await this.queryById(url.toString());
              } catch (error) {
                return item;
              }
            }
          }))]);
        }
      } else {
        expanded.push([key, value]);
      }
    }

    return JSON.parse(JSON.stringify(Object.fromEntries(expanded)));
  }

  async signAndSendToForeignActorInbox(foreignActorInbox: string, actor: AP.Actor, activity: AP.AnyThing & {
    [CONTEXT]: AP.StringReference
  }) {
    if (!actor.preferredUsername) {
      return;
    }

    const userId = await this.findStringIdByValue('username', actor.preferredUsername);
    const privateKey = await this.findStringValueById('private-key', userId);

    if (!privateKey) {
      throw new Error('User\'s private key not found.');
    }

    const foreignDomain = new URL(foreignActorInbox).hostname;
    const foreignPathName = new URL(foreignActorInbox).pathname;

    // sign
    const digestHash = crypto.createHash('sha256').update(JSON.stringify(activity)).digest('base64');
    const signer = crypto.createSign('sha256');
    const dateString = new Date().toUTCString();
    const stringToSign = `(request-target): post ${foreignPathName}\nhost: ${foreignDomain}\ndate: ${dateString}\ndigest: SHA-256=${digestHash}`;
    signer.update(stringToSign);
    signer.end();
    const signature = signer.sign(privateKey);
    const signature_b64 = signature.toString('base64');
    const signatureHeader = `keyId="${actor.url}#main-key",algorithm="rsa-sha256",headers="(request-target) host date digest",signature="${signature_b64}"`;
    
    console.log('SENDING...')

    // send
    return await fetch(foreignActorInbox, {
        method: 'post',
        body: JSON.stringify(activity),
        headers: {
            [CONTENT_TYPE_HEADER]: ACTIVITYSTREAMS_CONTENT_TYPE,
            [ACCEPT_HEADER]: ACTIVITYSTREAMS_CONTENT_TYPE,
            'Host': foreignDomain,
            'Date': dateString,
            'Digest': `SHA-256=${digestHash}`,
            'Signature': signatureHeader
        }
    });
  }

  async broadcastActivity(activity: APActivity, actor: AP.Actor) {
    const recipients = await this.getRecipientInboxUrls(activity);

    console.log(recipients);

    return await Promise.all(recipients.map(async recipient => {
      return await this.signAndSendToForeignActorInbox(recipient, actor, activity.formatPublicObject());
    }));
  }
  
  async getRecipientInboxUrls(activity: AP.Activity): Promise<string[]> {
    const recipients: string[] = [
      ...activity.to ? await this.getRecipientsList(activity.to) : [],
      ...activity.cc ? await this.getRecipientsList(activity.cc) : [],
      ...activity.bto ? await this.getRecipientsList(activity.bto) : [],
      ...activity.bcc ? await this.getRecipientsList(activity.bcc) : [],
    ];

    // get inbox for each recipient
    const recipientInboxes = await Promise.all(recipients.map(async recipient => {
      const foundThing = await this.queryById(recipient);

      if (foundThing && typeof foundThing === 'object' && 'inbox' in foundThing && foundThing.inbox) {
        return foundThing.inbox;
      }
    }));

    const recipientInboxUrls: string[] = [];

    for (const recipientInbox of recipientInboxes) {
      if (typeof recipientInbox === 'string') {
        recipientInboxUrls.push(recipientInbox);
      }
    }

    return [...new Set(recipientInboxUrls)];
  }

  async getRecipientsList(to: AP.ObjectOrLinkReference) {
    const toArray = Array.isArray(to) ? to : [to];
    const filteredToArray = toArray.filter(recipient => recipient !== PUBLIC_ACTOR);
    return filteredToArray.map(reference => {
      if (typeof reference === 'string') {
        return reference;
      }
      if ('id' in reference) {
        return reference.id;
      }
      if ('href' in reference) {
        return reference.href;
      }
      if (Array.isArray(reference)) {
        if (reference.every(item => typeof item === 'string')) {
          return reference;
        } else {
          return reference.map(item => {
            if (typeof item !== 'string' && 'id' in item) {
              return item;
            }
          });
        }
      }
    }).flat();
  }
}