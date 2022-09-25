import { Graph } from ".";
import * as AP from '../types/activity_pub';
import { getId } from '../utilities/getId';

export async function getCollectionItems(
  this: Graph,
  thing: string | AP.Collection | AP.OrderedCollection,
): Promise<AP.ObjectOrLinkReference> {
  const id = getId(thing);

  if (!id) {
    return [];
  }

  const collection = await this.findThingById(id);

  if (!collection) {
    return [];
  }

  if (
    collection.type !== AP.CollectionTypes.COLLECTION &&
    collection.type !== AP.CollectionTypes.ORDERED_COLLECTION
  ) {
    return [];
  }

  if (
    !(
      ('items' in collection && Array.isArray(collection.items)) ||
      ('orderedItems' in collection && Array.isArray(collection.orderedItems))
    )
  ) {
    return [];
  }

  const collectionItems =
    collection.type === AP.CollectionTypes.ORDERED_COLLECTION
      ? collection.orderedItems
      : collection.items;

  if (!Array.isArray(collectionItems)) {
    return [];
  }

  const foundItems: Array<null | AP.ObjectOrLinkReference> =
    await Promise.all(
      collectionItems.map(async (item) => {
        const id = getId(item);
        const foundItem = await this.queryById(id);

        if (!foundItem) {
          return null;
        }

        const expandedItem = await this.expandThing(foundItem);

        if ('likes' in expandedItem && expandedItem.likes) {
          if (typeof expandedItem.likes === 'string') {
            const likes = await this.queryById(expandedItem.likes);

            if (
              likes &&
              likes.type === AP.CollectionTypes.ORDERED_COLLECTION
            ) {
              expandedItem.likes = likes;
            }
          }
        }

        if ('shares' in expandedItem && expandedItem.shares) {
          if (typeof expandedItem.shares === 'string') {
            const shares = await this.queryById(expandedItem.shares);

            if (
              shares &&
              shares.type === AP.CollectionTypes.ORDERED_COLLECTION
            ) {
              expandedItem.shares = shares;
            }
          }
        }

        if ('object' in expandedItem && expandedItem.object) {
          if (
            typeof expandedItem.object === 'object' &&
            'likes' in expandedItem.object &&
            typeof expandedItem.object.likes === 'string'
          ) {
            const likes = await this.queryById(expandedItem.object.likes);

            if (
              likes &&
              likes.type === AP.CollectionTypes.ORDERED_COLLECTION
            ) {
              expandedItem.object.likes = likes;
            }
          }
        }

        if ('object' in expandedItem && expandedItem.object) {
          if (
            typeof expandedItem.object === 'object' &&
            'shares' in expandedItem.object &&
            typeof expandedItem.object.shares === 'string'
          ) {
            const shares = await this.queryById(expandedItem.object.shares);

            if (
              shares &&
              shares.type === AP.CollectionTypes.ORDERED_COLLECTION
            ) {
              expandedItem.object.shares = shares;
            }
          }
        }

        return await this.expandThing(expandedItem);
      }),
    );

  const filteredItems: AP.ObjectOrLinkReference = [];

  for (const foundItem of foundItems) {
    if (foundItem) {
      filteredItems.push(foundItem as AP.ObjectOrLinkReference);
    }
  }

  return filteredItems;
}