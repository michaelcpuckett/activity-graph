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


  public async saveActivity(activity: APActivity) {
    return await Promise.all([
      this.saveThing(activity.compress()),
      ...Object.values(activity.getCompressedProps()).map(async thing => {
        return await this.saveThing(new APThing(thing));
      }),
    ]);
  }

  private async saveThing(thing: AP.Thing) {
    // try {
      const url = new URL(thing.id ?? '');
      const isLocal = url.hostname === LOCAL_HOSTNAME;

      const [
        ,
        dbCollection,
      ] = url.pathname.split('/');

        await this.db.collection(isLocal ? dbCollection : 'foreign-object').replaceOne(
            {
              _id: url.pathname.split(`/${dbCollection}/`)[1],
            },
            JSON.parse(JSON.stringify(thing)),
            {
              upsert: true,
            }
        );
    // } catch (error: unknown) {
    //     console.error(error);
    //     throw new Error(String(error));
    // }
}

}