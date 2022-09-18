import * as AP from '../../types/activity_pub';
import { APCoreObject } from './core_object';

export class APActor extends APCoreObject implements AP.Actor {
  type: typeof AP.ActorTypes[keyof typeof AP.ActorTypes];
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

  override getCollectionType() {
    return 'actor';
  }

  constructor(actor: AP.AnyActor) {
    super(actor);

    if (Object.values(AP.ActorTypes).includes(actor.type)) {
      this.type = actor.type;
    } else {
      throw new Error('`type` must be defined and be one of the Actor Types.');
    }

    if (!actor.inbox) {
      throw new Error('Inbox property is required.');
    }

    this.inbox = actor.inbox;
    
    if (!actor.outbox) {
      throw new Error('Outbox property is required.');
    }

    this.outbox = actor.outbox;
  }
};
