import { Graph } from ".";
import * as AP from '../types/activity_pub';

export async function findOne(
  this: Graph,
  collection: string,
  matchingObject: Object,
): Promise<AP.AnyThing | null> {
  const value = await this.db.collection(collection).findOne(matchingObject);

  if (!value) {
    return value;
  }

  const { _id, ...one } = JSON.parse(JSON.stringify(value));

  return one;
}