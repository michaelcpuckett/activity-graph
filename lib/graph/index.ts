import { Db, MongoClient } from 'mongodb';
import { APActivity } from '../classes/activity_pub';
import { APCoreObject } from '../classes/activity_pub/core_object';
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
    await this.setObject(activity.compress());
  }

  private async setObject(object: APCoreObject) {
    try {
      const url = new URL(object.id ?? '');
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
            JSON.parse(JSON.stringify(object)),
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