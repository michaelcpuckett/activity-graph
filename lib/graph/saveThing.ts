import { Graph } from ".";
import * as AP from '../types/activity_pub';
import { getCollectionNameByUrl } from "../utilities/getCollectionNameByUrl";

export async function saveThing(this: Graph, thing: AP.AnyThing) {
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
    },
  );
}
