import * as AP from '../../types/activity_pub';

export class APObject implements AP.Object {
  id?: string | null;
  type: typeof AP.ObjectTypes[keyof typeof AP.ObjectTypes] | Array<typeof AP.ObjectTypes[keyof typeof AP.ObjectTypes]>;
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
  mediaType?: AP.StringReference;
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

  deleted?: Date;
  formerType?: typeof AP.ObjectTypes[keyof typeof AP.ObjectTypes] | Array<typeof AP.ObjectTypes[keyof typeof AP.ObjectTypes]>;
  
  subject?: string | AP.CoreObject | AP.Link;
  object?: AP.ObjectOrLinkReference;
  relationship?: AP.ObjectReference;

  accuracy?: number;
  altitude?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
  units?: string;
  
  describes?: string | AP.CoreObject;

  constructor(object: AP.AnyObject) {
    if (Object.values(AP.ObjectTypes).includes(object.type)) {
      this.type = object.type;
    } else {
      throw new Error('`type` must be defined and be one of the Object Types.');
    }

    if ('describes' in object) {
      if (object.type !== AP.ObjectTypes.PROFILE) {
        throw new Error('Some properties can only be used with `Profile` type.')
      }
    }
    
    if ('deleted' in object || 'formerType' in object) {
      if (object.type !== AP.ObjectTypes.TOMBSTONE) {
        throw new Error(`Some properties can only be used with "Tombstone" type.`);
      }
    }

    if ('subject' in object || 'object' in object || 'relationship' in object) {
      if (object.type !== AP.ObjectTypes.RELATIONSHIP) {
        throw new Error(`Some properties can only be used with "Relationship" type.`);
      }
    }

    if ('accuracy' in object || 'altitude' in object || 'latitude' in object || 'longitude' in object || 'radius' in object || 'units' in object) {
      if (object.type !== AP.ObjectTypes.PLACE) {
        throw new Error(`Some properties can only be used with "Place" type.`);
      }
    }
    
    Object.assign(this, object);
  }
}
