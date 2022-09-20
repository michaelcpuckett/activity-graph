import { Db, MongoClient } from 'mongodb';
import { APActivity, APActor, APCollection, APLink, APObject, APOrderedCollection } from '../classes/activity_pub';
import { APCollectionPage } from '../classes/activity_pub/collection_page';
import { LOCAL_HOSTNAME } from '../globals';
import * as AP from '../types/activity_pub';
import * as firebaseAdmin from 'firebase-admin';
import { AppOptions } from 'firebase-admin';
import serviceAccount from '../../credentials';
import { APThing } from '../classes/activity_pub/thing';

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
    const collectionName = this.getCollectionNameByUrl(_id);
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

  public async saveActivity(activity: APActivity) {
    return await Promise.all([
      this.saveThing(activity.compress()),
      ...Object.values(activity.getCompressedProps()).map(async thing => {
        return await this.saveThing(thing);
      }),
    ]);
  }

  public async saveThing(thing: AP.AnyThing) {
    if (!thing.id) {
      throw new Error('No ID.');
    }

    const collectionName = this.getCollectionNameByUrl(thing.id);
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
    const collectionItem = await this.findOne('collection', { _id: path });

    if (!collectionItem || !('orderedItems' in collectionItem)) {
      throw new Error('Error');
    }

    if (collectionItem.type === AP.CollectionPageTypes.ORDERED_COLLECTION_PAGE) {
      throw new Error('Error');
    }

    const collection = new APOrderedCollection(collectionItem);
    console.log(collection.totalItems);

    await this.db.collection('collection').updateOne({
      _id: path
    }, {
      $set: { totalItems: (collection.totalItems ?? 0) + 1, },
      $push: { "orderedItems": url },
    }, {
      upsert: true,
    });
  }
  
  async removeOrderedItem(path: string, url: string) {
    const collectionItem = await this.findOne('collection', { _id: path });

    if (!collectionItem || !('orderedItems' in collectionItem)) {
      throw new Error('Error');
    }

    if (collectionItem.type === AP.CollectionPageTypes.ORDERED_COLLECTION_PAGE) {
      throw new Error('Error');
    }

    const collection = new APOrderedCollection(collectionItem);
    console.log(collection.totalItems);

    await this.db.collection('collection').updateOne({
      _id: path
    }, {
      $set: { totalItems: (collection.totalItems ?? 0) + 1, },
      $pull: { "orderedItems": url },
    }, {
      upsert: true,
    });
  }

  async insertItem(path: string, url: string) {
    const collectionItem = await this.findOne('collection', { _id: path });

    if (!collectionItem || !('orderedItems' in collectionItem)) {
      throw new Error('Error');
    }

    if (collectionItem.type === AP.CollectionPageTypes.ORDERED_COLLECTION_PAGE) {
      throw new Error('Error');
    }
    const collection = new APCollection(collectionItem);

    await this.db.collection('collection').updateOne({
      _id: path
    }, {
      $set: { totalItems: (collection.totalItems ?? 0) + 1, },
      $push: { "items": url },
    }, {
      upsert: true,
    });
  }
  
  async removeItem(path: string, url: string) {
    const collectionItem = await this.findOne('collection', { _id: path });

    if (!collectionItem || !('orderedItems' in collectionItem)) {
      throw new Error('Error');
    }

    if (collectionItem.type === AP.CollectionPageTypes.ORDERED_COLLECTION_PAGE) {
      throw new Error('Error');
    }
    const collection = new APCollection(collectionItem);
    console.log(collection.totalItems);

    await this.db.collection('collection').updateOne({
      _id: path
    }, {
      $set: { totalItems: (collection.totalItems ?? 0) + 1, },
      $pull: { "items": url },
    }, {
      upsert: true,
    });
  }

  // Other

  // TODO?
  public getCollectionNameByUrl(url: string) {
    const [ , collectionName, identifier, nextIdentifier, finalIdentifier ] = new URL(url).pathname.split('/');

    return (!finalIdentifier && nextIdentifier) ? 'collection' : collectionName;
  }

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