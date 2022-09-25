import { Graph } from ".";
import * as AP from '../types/activity_pub';
import { getCollectionNameByUrl } from "../utilities/getCollectionNameByUrl";

export async function findThingById(this: Graph, _id: string): Promise<AP.AnyThing | null> {
  const collectionName = getCollectionNameByUrl(_id);
  return await this.findOne(collectionName, { _id });
}