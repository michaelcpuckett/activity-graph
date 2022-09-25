import { Graph } from ".";
import * as AP from '../types/activity_pub';
import { getId } from '../utilities/getId';
import { APOrderedCollection, APCollection } from '../classes/activity_pub';

export async function expandCollection(
  this: Graph,
  collection: string | AP.Collection | AP.OrderedCollection,
): Promise<null | AP.Collection | AP.OrderedCollection> {
  const id = getId(collection);

  if (!id) {
    return null;
  }

  const foundThing = await this.queryById(id);

  if (!foundThing) {
    return null;
  }

  if (
    foundThing.type !== AP.CollectionTypes.COLLECTION &&
    foundThing.type !== AP.CollectionTypes.ORDERED_COLLECTION
  ) {
    return null;
  }

  const items = await this.getCollectionItems(foundThing);

  if (foundThing.type === AP.CollectionTypes.ORDERED_COLLECTION) {
    return JSON.parse(
      JSON.stringify(
        new APOrderedCollection({
          ...foundThing,
          orderedItems: items,
        }),
      ),
    );
  }

  if (foundThing.type === AP.CollectionTypes.COLLECTION) {
    return JSON.parse(
      JSON.stringify(
        new APCollection({
          ...foundThing,
          items: items,
        }),
      ),
    );
  }

  return null;
}
