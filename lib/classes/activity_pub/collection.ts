import * as AP from '../../types/activity_pub';
import { APCoreObject } from './core_object';

export class APCollection extends APCoreObject implements AP.Collection {
  type: typeof AP.CollectionTypes[keyof typeof AP.CollectionTypes];
  totalItems?: number;
  items?: AP.ObjectOrLinkReference;
  current?: string | AP.CollectionPage | AP.Link;
  first?: string | AP.CollectionPage | AP.Link;
  last?: string | AP.CollectionPage | AP.Link;

  override getCollectionType() {
    return 'collection';
  }

  constructor(collection: AP.AnyCollection) {
    super(collection);

    if (Object.values(AP.CollectionTypes).includes(collection.type)) {
      this.type = collection.type;
    } else {
      throw new Error('`type` must be defined and be one of the Collection Types.');
    }
  }
};

export class APOrderedCollection extends APCollection implements AP.OrderedCollection {
  type: typeof AP.CollectionTypes.ORDERED_COLLECTION;
  orderedItems?: AP.ObjectOrLinkReference;

  constructor(collection: AP.OrderedCollection) {
    super(collection);

    if (collection.type !== AP.CollectionTypes.ORDERED_COLLECTION) {
      throw new Error('Must be an OrderedCollection.')
    } else {
      this.type = collection.type;
    }
  }
}