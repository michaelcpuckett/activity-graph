import * as AP from '../../types/activity_pub';
import { APCoreObject } from './core_object';

export class APCollection extends APCoreObject implements AP.Collection {
  type: typeof AP.CollectionTypes[keyof typeof AP.CollectionTypes];
  totalItems?: number;
  items?: AP.ObjectOrLinkReference;
  current?: string | AP.CollectionPage | AP.Link;
  first?: string | AP.CollectionPage | AP.Link;
  last?: string | AP.CollectionPage | AP.Link;

  constructor(collection: AP.AnyCollection) {
    super(collection);

    if (Object.values(AP.CollectionTypes).includes(collection.type)) {
      this.type = collection.type;
    } else {
      throw new Error('`type` must be defined and be one of the Collection Types.');
    }
  }
};
