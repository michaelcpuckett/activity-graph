import * as AP from '../../types/activity_pub';
import { APCoreObject } from './core_object';

export class APCollection extends APCoreObject implements AP.Collection {
  type: typeof AP.CollectionTypes.COLLECTION;
  totalItems?: number;
  items?: AP.ObjectOrLinkReference;
  current?: string | AP.CollectionPage | AP.Link;
  first?: string | AP.CollectionPage | AP.Link;
  last?: string | AP.CollectionPage | AP.Link;

  override getCollectionType() {
    return 'collection';
  }

  constructor(collection: AP.Collection) {
    super(collection);

    if (collection.type !== AP.CollectionTypes.COLLECTION) {
      throw new Error(
        '`type` must be defined and be one of the Collection Types.',
      );
    } else {
      this.type = collection.type;
    }
  }
}

export class APOrderedCollection
  extends APCoreObject
  implements AP.OrderedCollection
{
  type: typeof AP.CollectionTypes.ORDERED_COLLECTION;
  totalItems?: number;
  items?: AP.ObjectOrLinkReference;
  current?: string | AP.CollectionPage | AP.Link;
  first?: string | AP.CollectionPage | AP.Link;
  last?: string | AP.CollectionPage | AP.Link;
  orderedItems?: AP.ObjectOrLinkReference;

  constructor(collection: AP.OrderedCollection) {
    super(collection);

    if (collection.type !== AP.CollectionTypes.ORDERED_COLLECTION) {
      throw new Error('Must be an OrderedCollection.');
    } else {
      this.type = collection.type;
    }
  }
}
