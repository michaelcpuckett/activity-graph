import { Db, MongoClient } from 'mongodb';
import * as firebaseAdmin from 'firebase-admin';
import { AppOptions } from 'firebase-admin';

import { APActivity, APCollection, APOrderedCollection } from '../classes/activity_pub';
import serviceAccount from '../../credentials';
import { getCollectionNameByUrl } from '../utilities/getCollectionNameByUrl';
import * as AP from '../types/activity_pub';

export class Graph {
  db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  static async connect() {
    const dbName = 'activitypub';
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

  // Other

  // TODO?
  
  async expandThing(thing: AP.AnyThing): Promise<AP.AnyThing> {
    const expanded = [];

    for (const [key, value] of Object.entries(thing)) {
      if (key === 'id' || key === 'type') {
        expanded.push([key, value]);
      } else if (typeof value === 'string') {
        try {
          const url = new URL(value);
          expanded.push([key, await this.findThingById(url.toString())]);
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
                return await this.findThingById(url.toString());
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
}