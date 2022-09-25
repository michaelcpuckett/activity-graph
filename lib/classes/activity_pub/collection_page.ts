import * as AP from '../../types/activity_pub';
import { APCoreObject } from './core_object';

export class APCollectionPage
  extends APCoreObject
  implements AP.CollectionPage
{
  type: typeof AP.CollectionPageTypes[keyof typeof AP.CollectionPageTypes];
  partOf?: string | AP.CollectionPage | AP.Link;
  next?: string | AP.CollectionPage | AP.Link;
  prev?: string | AP.CollectionPage | AP.Link;
  totalItems?: number;
  items?: AP.ObjectOrLinkReference;
  current?: string | AP.CollectionPage | AP.Link;
  first?: string | AP.CollectionPage | AP.Link;
  last?: string | AP.CollectionPage | AP.Link;

  override getCollectionType() {
    return 'collection-page';
  }

  constructor(collectionPage: AP.AnyCollectionPage) {
    super(collectionPage);

    if (Object.values(AP.CollectionPageTypes).includes(collectionPage.type)) {
      this.type = collectionPage.type;
    } else {
      throw new Error(
        '`type` must be defined and be one of the CollectionPage Types.',
      );
    }
  }
}

export class APOrderedCollectionPage
  extends APCollectionPage
  implements AP.OrderedCollectionPage
{
  type: typeof AP.CollectionPageTypes.ORDERED_COLLECTION_PAGE;
  orderedItems?: AP.ObjectOrLinkReference;
  startIndex?: number;

  constructor(collectionPage: AP.OrderedCollectionPage) {
    super(collectionPage);

    if (
      collectionPage.type !== AP.CollectionPageTypes.ORDERED_COLLECTION_PAGE
    ) {
      throw new Error('Must be an OrderedCollectionPage.');
    } else {
      this.type = collectionPage.type;
    }
  }
}
