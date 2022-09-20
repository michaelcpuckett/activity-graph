export { APObject } from './object';
export { APActor } from './actor';
export { APActivity } from './activity';
export { APCollection, APOrderedCollection } from './collection';
export { APCollectionPage, APOrderedCollectionPage } from './collection_page';
export { APLink } from './link';

import { APObject } from './object';
import { APActor } from './actor';
import { APActivity } from './activity';
import { APCollection, APOrderedCollection } from './collection';
import { APCollectionPage, APOrderedCollectionPage } from './collection_page';
import { APLink } from './link';

export type APAnyThing = APObject | APActor | APActivity | APCollection | APOrderedCollection | APCollectionPage | APOrderedCollectionPage | APLink;
