import { Db, MongoClient } from 'mongodb';
import { APActivity, APCollection } from '../classes/activity_pub';
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

  
  async createCollection(objectUrl: string, collectionType: typeof AP.CollectionTypes[keyof typeof AP.CollectionTypes] = AP.CollectionTypes.COLLECTION) {
    // try {
      const [ , collectionName, parent, identifier ] = new URL(objectUrl).pathname.split('/');

      const name = collectionName[0].toUpperCase() + collectionName.slice(1);

      const collection = new APCollection({
        "id": objectUrl,
        "type": collectionType,
        "name": name,
        "url": objectUrl,
        "items": [],
      });

      await this.db.collection(collectionName).updateOne({
          identifier: `${parent}/${identifier}`
      }, {
          $set: collection.compress(),
      }, {
          upsert: true,
      });
    // } catch (error: unknown) {
    //   console.error(error);
    //   throw new Error(String(error));
    // }
  }


  public async saveActivity(activity: APActivity) {
    return await Promise.all([
      this.saveThing(activity.compress()),
      ...Object.values(activity.getCompressedProps()).map(async (thing) => {
        return await this.saveThing(thing as APThing);
      }),
    ]);
  }

  private async saveThing(thing: APThing) {
    try {
      const url = new URL(thing.id ?? '');
      const isLocal = url.hostname === LOCAL_HOSTNAME;

      const [
        ,
        collection,
        guid,
      ] = url.pathname.split('/');

        await this.db.collection(isLocal ? collection : 'foreign-object').replaceOne(
            {
              _id: isLocal ? guid : url,
            },
            JSON.parse(JSON.stringify(thing)),
            {
              upsert: true,
            }
        );
    } catch (error: unknown) {
        console.error(error);
        throw new Error(String(error));
    }
}

}