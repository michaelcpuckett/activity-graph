import * as AP from '../../types/activity_pub';

export class APActivity implements AP.Activity {
  id?: string | null;
  type: typeof AP.ActivityTypes[keyof typeof AP.ActivityTypes];
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
  
  actor: AP.ObjectOrLinkReference;
  object?: AP.ObjectOrLinkReference;
  target?: AP.ObjectOrLinkReference;
  result?: AP.ObjectOrLinkReference;
  origin?: AP.ObjectOrLinkReference;
  instrument?: AP.ObjectOrLinkReference;

  constructor(activity: AP.AnyActivity) {
    if (Object.values(AP.ActivityTypes).includes(activity.type)) {
      this.type = activity.type;
    } else {
      throw new Error('`type` must be defined and be one of the Activity Types.');
    }

    if (activity.actor) {
      this.actor = activity.actor;
    } else {
      throw new Error('`actor` must be defined.');
    }

    Object.assign(this, activity);
  }
};
