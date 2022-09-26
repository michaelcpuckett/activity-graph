import * as AP from '../types/activity_pub';
import { Graph } from '../graph';

export async function getCount(collection?: string | AP.Collection | AP.OrderedCollection): Promise<number> {
  const graph = await Graph.connect();

  if (typeof collection === 'string') {
    const foundThing = await graph.findThingById(collection);

    if (foundThing && (foundThing.type === AP.CollectionTypes.COLLECTION || foundThing.type === AP.CollectionTypes.ORDERED_COLLECTION)) {
      if (foundThing.totalItems) {
        return foundThing.totalItems;
      }
    }
  } else if (collection && collection.totalItems) {
    return collection.totalItems;
  }

  return 0;
}