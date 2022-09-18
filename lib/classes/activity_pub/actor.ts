import * as AP from '../../types/activity_pub';

export class APActor implements AP.Actor {
  id?: string | null;
  type: typeof AP.ActorTypes[keyof typeof AP.ActorTypes];
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
  
  inbox: string | AP.OrderedCollection;
  outbox: string | AP.OrderedCollection;
  following?: string | AP.Collection;
  followers?: string | AP.Collection;
  liked?: string | AP.Collection;
  preferredUsername?: string;
  preferredUsernameMap?: { (key: string): string; };
  streams?: AP.CollectionReference;
  collections?: {
    [key: string]: AP.CollectionReference;
  };
  endpoints?: {
    [key: string]: string|undefined;
    proxyUrl?: string;
    oauthAuthorizationEndpoint?: string;
    oauthTokenEndpoint?: string;
    provideClientKey?: string;
    signClientKey?: string;
    sharedInbox?: string;
  };
  publicKey?: {
    id: string;
    owner: string;
    publicKeyPem: string;
  };

  constructor(object: AP.AnyActor) {
    if (Object.values(AP.ActorTypes).includes(object.type)) {
      this.type = object.type;
    } else {
      throw new Error('`type` must be defined and be one of the Actor Types.');
    }

    if (!object.inbox) {
      throw new Error('Inbox property is required.');
    }

    this.inbox = object.inbox;
    
    if (!object.outbox) {
      throw new Error('Outbox property is required.');
    }

    this.outbox = object.outbox;

    Object.assign(this, object);
  }
};
