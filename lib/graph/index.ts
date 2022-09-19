import { Db, MongoClient } from 'mongodb';
import { APActivity, APActor, APCollection, APLink, APObject } from '../classes/activity_pub';
import { APCollectionPage } from '../classes/activity_pub/collection_page';
import { APCoreObject } from '../classes/activity_pub/core_object';
import { APThing } from '../classes/activity_pub/thing';
import { LOCAL_HOSTNAME } from '../globals';
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

  private async findOne(collection: string, matchingObject: Object) {
    // try {
    return JSON.parse(JSON.stringify(await this.db.collection(collection).findOne(matchingObject)));
    // } catch (error: unknown) {
    //   return null;
    // }
  }

  public async getActorByPreferredUsername(preferredUsername: string) {
    return await this.findOne('actor', { preferredUsername });
  }


  public async saveActivity(activity: APActivity) {
    return await Promise.all([
      this.saveThing(activity.compress()),
      ...Object.values(activity.getCompressedProps()).map(async thing => {
        return await this.saveThing(thing);
      }),
    ]);
  }

  getTypedThing(thing: AP.AnyThing) {
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

  private async saveThing(thing: AP.AnyThing) {
    const url = new URL(thing.id ?? '');
    const isLocal = url.hostname === LOCAL_HOSTNAME;
    const dbCollection = isLocal ? this.getTypedThing(thing)?.getCollectionType() ?? 'object' : 'foreign-object';

    await this.db.collection(dbCollection).replaceOne(
        {
          _id: isLocal ? url.pathname : url,
        },
        JSON.parse(JSON.stringify(thing)),
        {
          upsert: true,
        }
    );
  }
}