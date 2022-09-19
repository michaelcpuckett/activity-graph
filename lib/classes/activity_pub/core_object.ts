import { ACTIVITYSTREAMS_CONTEXT, CONTEXT } from '../../globals';
import * as AP from '../../types/activity_pub';
import { APThing } from './thing';

export class APCoreObject extends APThing implements AP.CoreObject {
  type: typeof AP.CoreObjectTypes[keyof typeof AP.CoreObjectTypes];
  url: AP.StringReference | AP.LinkReference;
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
  source?: {
    content?: AP.StringReference;
    contentMap?: AP.StringReferenceMap;
  };

  constructor(object: AP.AnyCoreObject) {
    super(object);

    if (Object.values(AP.CoreObjectTypes).includes(object.type)) {
      this.type = object.type;
    } else {
      throw new Error('Bad type.')
    }

    if (object.url) {
      this.url = object.url;
    } else if (this.id) {
      this.url = this.id;
    } else {
      throw new Error('Could not generate URL');
    }
  }

  public override formatPublicObject(): AP.AnyThing & {
    [CONTEXT]: string|string[];
  } {
    const compressed = this.compress();

    if ('bto' in compressed) {
      delete compressed.bto;
    }

    if ('bcc' in compressed) {
      delete compressed.bcc;
    }

    return {
      [CONTEXT]: ACTIVITYSTREAMS_CONTEXT,
      ...compressed,
    };
  }
}