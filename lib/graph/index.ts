import { Db, MongoClient } from 'mongodb';

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
}