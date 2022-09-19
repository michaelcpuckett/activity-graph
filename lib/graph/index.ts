import { Db, MongoClient } from 'mongodb';
import { APActivity, APActor, APCollection, APLink, APObject } from '../classes/activity_pub';
import { APCollectionPage } from '../classes/activity_pub/collection_page';
import { LOCAL_HOSTNAME } from '../globals';
import * as AP from '../types/activity_pub';
import * as firebaseAdmin from 'firebase-admin';
import { AppOptions } from 'firebase-admin';
import serviceAccount from '../../credentials';

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

  public async findOne(collection: string, matchingObject: Object) {
    return JSON.parse(JSON.stringify(await this.db.collection(collection).findOne(matchingObject)));
  }

  public async findThingById(id: string) {
    const [ , collectionName ] = new URL(id).pathname.split('/');

    return await this.findOne(collectionName, { id });
  }

  public async findStringValueById(dbCollection: string, _id: string) {
    return (await this.findOne(dbCollection, { _id }))?.value ?? '';
  }

  public async findStringIdByValue(dbCollection: string, value: string) {
    return (await this.findOne(dbCollection, { value }))?._id ?? '';
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

  async getActorByToken(token: string): Promise<string|null> {
    const userId = await this.getAuthenticatedUserIdByToken(token);

    if (!userId) {
      return null;
    }

    const preferredUsername = await this.findStringValueById('username', userId);

    return await this.findOne('actor', { preferredUsername });
  }

  // Save.

  public async saveActivity(activity: APActivity) {
    return await Promise.all([
      this.saveThing(activity.compress()),
      ...Object.values(activity.getCompressedProps()).map(async thing => {
        return await this.saveThing(thing);
      }),
    ]);
  }

  public async saveThing(thing: AP.AnyThing) {
    const url = new URL(thing.id ?? '');
    const isLocal = url.hostname === LOCAL_HOSTNAME;
    const dbCollection = isLocal ? this.getTypedThing(thing)?.getCollectionType() ?? 'object' : 'foreign-object';

    return await this.db.collection(dbCollection).replaceOne(
        {
          _id: isLocal ? url.pathname : url,
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

  // Other

  public getTypedThing(thing: AP.AnyThing) {
    for (const linkType of Object.values(AP.LinkTypes)) {
      if (thing.type === linkType) {
        return new APLink(thing);
      }
    }

    for (const activityType of Object.values(AP.ActivityTypes)) {
      if (thing.type === activityType) {
        return new APActivity(thing);
      }
    }
    
    for (const actorType of Object.values(AP.ActorTypes)) {
      if (thing.type === actorType) {
        return new APActor(thing);
      }
    }
    
    for (const collectionType of Object.values(AP.CollectionTypes)) {
      if (thing.type === collectionType) {
        return new APCollection(thing);
      }
    }
    
    for (const collectionPageType of Object.values(AP.CollectionPageTypes)) {
      if (thing.type === collectionPageType) {
        return new APCollectionPage(thing);
      }
    }
    
    for (const objectType of Object.values(AP.ObjectTypes)) {
      if (thing.type === objectType) {
        return new APObject(thing);
      }
    }

    return null;
  }
}