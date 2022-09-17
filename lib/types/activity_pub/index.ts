import * as AS from '../activity_streams';

export {
  ObjectTypes,
  LinkTypes,
  ActorTypes,
  ActivityTypes,
  CollectionTypes,
  CollectionPageTypes
} from '../activity_streams';

type Thing = Omit<AS.Thing, 'id'> & {
  id?: string | null;
}

export type CoreObject = Omit<AS.CoreObject, 'id'> & Thing & {
  source?: {
    content?: StringReference,
    contentMap?: StringReferenceMap,
  };
  attachment?: ObjectOrLinkReference;
  attributedTo?: ObjectOrLinkReference;
  audience?: ObjectOrLinkReference;
  bcc?: ObjectOrLinkReference;
  bto?: ObjectOrLinkReference;
  cc?: ObjectOrLinkReference;
  content?: StringReference;
  contentMap?: StringReferenceMap;
  context?: ObjectOrLinkReference;
  duration?: string;
  endTime?: Date;
  generator?: ObjectOrLinkReference;
  icon?: ImageReference | LinkReference;
  image?: ImageReference | LinkReference;
  inReplyTo?: ObjectOrLinkReference;
  location?: ObjectOrLinkReference;
  mediaType?: StringReference;
  name?: StringReference;
  nameMap?: StringReferenceMap;
  preview?: ObjectOrLinkReference;
  published?: Date;
  replies?: string | Collection;
  startTime?: Date;
  summary?: StringReference;
  summaryMap?: StringReferenceMap;
  tag?: ObjectOrLinkReference;
  to?: ObjectOrLinkReference;
  updated?: Date;
  url?: StringReference | LinkReference;
};

export type Actor = Omit<AS.Actor, 'id'> & CoreObject & {
  inbox: string | OrderedCollection;
  outbox: string | OrderedCollection;
  following?: string | Collection;
  followers?: string | Collection;
  liked?: string | Collection;
  preferredUsername?: string;
  preferredUsernameMap?: { (key: string): string; };
  streams?: CollectionReference;
  collections?: {
    [key: string]: CollectionReference;
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
};

export type Application = AS.Application & Actor;
export type Service = AS.Application & Actor;
export type Person = AS.Person & Actor;
export type Group = AS.Group & Actor;
export type Organization = AS.Organization & Actor;

export type Object = Omit<AS.Object, 'id'> & CoreObject & {
  likes?: string | OrderedCollection;
  shares?: string | OrderedCollection;
};
export type Tombstone = AS.Tombstone & Object;
export type Relationship = AS.Relationship & Object;
export type Article = AS.Article & Object;
export type Note = AS.Note & Object;
export type Page = AS.Page & Object;
export type Event = AS.Event & Object;
export type Place = AS.Place & Object;
export type Document = AS.Document & Object;
export type Image = AS.Image & Object;
export type Audio = AS.Audio & Object;
export type Video = AS.Video & Object;
export type Profile = AS.Profile & Object;

export type Link = AS.Link & CoreObject;
export type Mention = AS.Mention & Link;

export type Activity = AS.Activity & CoreObject;
export type IntransitiveActivity = AS.IntransitiveActivity & CoreObject;
export type Accept = AS.Accept & Activity;
export type TentativeAccept = AS.TentativeAccept & IntransitiveActivity;
export type Add = AS.Add & Activity;
export type Arrive = AS.Arrive & IntransitiveActivity;
export type Create = AS.Create & Activity;
export type Delete = AS.Delete & Activity;
export type Follow = AS.Follow & Activity;
export type Ignore = AS.Ignore & Activity;
export type Join = AS.Join & Activity;
export type Leave = AS.Leave & Activity;
export type Like = AS.Like & Activity;
export type Offer = AS.Offer & Activity;
export type Invite = AS.Invite & Activity;
export type Reject = AS.Reject & Activity;
export type TentativeReject = AS.TentativeReject & Activity;
export type Remove = AS.Remove & Activity;;
export type Undo = AS.Undo & Activity;
export type Update = AS.Update & Activity;
export type View = AS.View & Activity;
export type Listen = AS.Listen & Activity;
export type Read = AS.Read & Activity;
export type Move = AS.Move & Activity;
export type Travel = AS.Travel & IntransitiveActivity;
export type Announce = AS.Announce & Activity;
export type Block = AS.Block & Activity;
export type Flag = AS.Flag & Activity;
export type Dislike = AS.Dislike & Activity;
export type Question = AS.Question & Activity;

export type Collection = AS.Collection & CoreObject;
export type OrderedCollection = AS.OrderedCollection & CoreObject;
export type CollectionPage = AS.CollectionPage & CoreObject;
export type OrderedCollectionPage = AS.OrderedCollectionPage & CoreObject;

export type StringReference = string | string[];
export type StringReferenceMap = { (key: string): StringReference; }
export type ObjectReference = StringReference | CoreObject | CoreObject[];
export type LinkReference = StringReference | Link | Link[];
export type ImageReference = StringReference | Image[]; 
export type CollectionReference = StringReference | Collection | Collection[];
export type ObjectOrLinkReference = StringReference | ObjectReference | LinkReference;
export type CollectionPageReference = CollectionPage | CollectionPage[];
