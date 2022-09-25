import { Db, MongoClient } from 'mongodb';
import { dbName } from '../../config';

import { findOne } from './findOne';
import { findThingById } from './findThingById';
import { findStringValueById } from './findStringValueById';
import { findStringIdByValue } from './findStringIdByValue';
import { getAuthenticatedUserIdByToken } from './getAuthenticatedActorByToken';
import { getActorByToken } from './getActorByToken';
import { saveThing } from './saveThing';
import { saveString } from './saveString';
import { insertItem, removeOrderedItem, insertOrderedItem, removeItem } from './insert';
import { fetchThingById } from './fetchThingById';
import { queryById } from './queryById';
import { expandThing } from './expandThing';
import { signAndSendToForeignActorInbox } from './signAndSendToForeignActorInbox';
import { broadcastActivity } from './broadcastActivity';
import { getRecipientInboxUrls } from './getRecipientInboxUrls';
import { getRecipientsList } from './getRecipientsList';
import { getCollectionItems } from './getCollectionItems';
import { expandCollection } from './expandCollection';

export class Graph {
  db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  static async connect() {
    const client = new MongoClient('mongodb://testing:testing@localhost:27017');
    await client.connect();
    const db = client.db(dbName);
    return new Graph(db);
  }

  // Find.

  public findOne = findOne;
  public findThingById = findThingById;
  public findStringValueById = findStringValueById;
  public findStringIdByValue = findStringIdByValue;

  // Get.

  public getAuthenticatedUserIdByToken = getAuthenticatedUserIdByToken;
  public getActorByToken = getActorByToken;

  // Save.

  public saveThing = saveThing;
  public saveString = saveString;

  // Insert/Remove

  public insertItem = insertItem;
  public removeItem = removeItem;
  public insertOrderedItem = insertOrderedItem;
  public removeOrderedItem = removeOrderedItem;

  // Fetch.

  public fetchThingById = fetchThingById;
  public queryById = queryById;

  // Send.

  public signAndSendToForeignActorInbox = signAndSendToForeignActorInbox;
  public broadcastActivity = broadcastActivity;
  public getRecipientInboxUrls = getRecipientInboxUrls;
  public getRecipientsList = getRecipientsList;

  // Expand

  public expandThing = expandThing;
  public getCollectionItems = getCollectionItems;
  public expandCollection = expandCollection;
}
