import * as AP from '../../types/activity_pub';

export type Complete<T> = {
  [P in keyof Required<T>]: Pick<T, P> extends Required<Pick<T, P>> ? T[P] : (T[P] | undefined);
};

export class APObject implements Complete<AP.Object> {
  id?: string | null;
  type: typeof AP.ObjectTypes[keyof typeof AP.ObjectTypes];
  likes?: string | AP.OrderedCollection;
  shares?: string | AP.OrderedCollection;
  attachment?: AP.ObjectOrLinkReference;
  attributedTo?: AP.ObjectOrLinkReference;
  audience?: AP.ObjectOrLinkReference;
  bcc?: AP.ObjectOrLinkReference;
  bto?: AP.ObjectOrLinkReference;
  cc?: AP.ObjectOrLinkReference;
  content?: StringReference;
  contentMap?: StringReferenceMap;
  context?: AP.ObjectOrLinkReference;
  duration?: string;
  endTime?: Date;
  generator?: AP.ObjectOrLinkReference;
  icon?: ImageReference | LinkReference;
  image?: ImageReference | LinkReference;
  inReplyTo?: AP.ObjectOrLinkReference;
  location?: AP.ObjectOrLinkReference;
  mediaType?: StringReference;
  name?: StringReference;
  nameMap?: StringReferenceMap;
  preview?: AP.ObjectOrLinkReference;
  published?: Date;
  replies?: string | Collection;
  startTime?: Date;
  summary?: StringReference;
  summaryMap?: StringReferenceMap;
  tag?: AP.ObjectOrLinkReference;
  to?: AP.ObjectOrLinkReference;
  updated?: Date;
  url?: StringReference | LinkReference;

  constructor(object: APObject) {
    this.type = object.type;
    Object.assign(this, object);
  }
}
