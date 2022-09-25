import { Graph } from ".";
import * as AP from '../types/activity_pub';

export async function queryById(this: Graph, id: string): Promise<AP.AnyThing | null> {
  try {
    return (await this.findThingById(id)) ?? (await this.fetchThingById(id));
  } catch (error: unknown) {
    throw new Error(String(error));
  }
}
