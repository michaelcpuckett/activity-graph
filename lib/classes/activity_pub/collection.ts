import * as AP from '../../types/activity_pub';

export class APCollection implements AP.Collection {
  id?: string | null;
  type: typeof AP.CollectionTypes[keyof typeof AP.CollectionTypes];
  likes?: string | AP.OrderedCollection;
  shares?: string | AP.OrderedCollection;
  attachment?: AP.ObjectOrLinkReference;
  attributedTo?: AP.ObjectOrLinkReference;
  audience?: AP.ObjectOrLinkReference;
  bcc?: AP.ObjectOrLinkReference;
  bto?: AP.ObjectOrLinkReference;
  cc?: AP.ObjectOrLinkReference;
  content?: AP.StringReference;
  contentMap?: AP.StringReferenceMap;
  context?: AP.ObjectOrLinkReference;
  duration?: string;
  endTime?: Date;
  generator?: AP.ObjectOrLinkReference;
  icon?: AP.ImageReference | AP.LinkReference;
  image?: AP.ImageReference | AP.LinkReference;
  inReplyTo?: AP.ObjectOrLinkReference;
  location?: AP.ObjectOrLinkReference;
  mediaType?: string;
  name?: AP.StringReference;
  nameMap?: AP.StringReferenceMap;
  preview?: AP.ObjectOrLinkReference;
  published?: Date;
  replies?: string | AP.Collection;
  startTime?: Date;
  summary?: AP.StringReference;
  summaryMap?: AP.StringReferenceMap;
  tag?: AP.ObjectOrLinkReference;
  to?: AP.ObjectOrLinkReference;
  updated?: Date;
  url?: AP.StringReference | AP.LinkReference;
  source?: {
    content?: AP.StringReference;
    contentMap?: AP.StringReferenceMap;
  };
  
  totalItems?: number;
  items?: AP.ObjectOrLinkReference;
  current?: string | AP.CollectionPage | AP.Link;
  first?: string | AP.CollectionPage | AP.Link;
  last?: string | AP.CollectionPage | AP.Link;

  constructor(collection: AP.AnyCollection) {
    if (Object.values(AP.CollectionTypes).includes(collection.type)) {
      this.type = collection.type;
    } else {
      throw new Error('`type` must be defined and be one of the Collection Types.');
    }
    
    Object.assign(this, collection);
  }
};
