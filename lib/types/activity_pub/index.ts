export const ObjectTypes = {
  ARTICLE: "Article",
  AUDIO: "Audio",
  DOCUMENT: "Document",
  EVENT: "Event",
  IMAGE: "Image",
  NOTE: "Note",
  PAGE: "Page",
  PLACE: "Place",
  PROFILE: "Profile",
  RELATIONSHIP: "Relationship",
  TOMBSTONE: "Tombstone",
  VIDEO: "Video",
} as const;

export const LinkTypes = {
  LINK: "Link",
  MENTION: "Mention",
} as const;

export const ActorTypes = {
  APPLICATION: "Application",
  GROUP: "Group",
  ORGANIZATION: "Organization",
  PERSON: "Person",
  SERVICE: "Service",
} as const;

export const ActivityTypes = {
  ACCEPT: "Accept",
  ADD: "Add",
  ANNOUNCE: "Announce",
  ARRIVE: "Arrive",
  BLOCK: "Block",
  CREATE: "Create",
  DELETE: "Delete",
  DISLIKE: "Dislike",
  FLAG: "Flag",
  FOLLOW: "Follow",
  IGNORE: "Ignore",
  INVITE: "Invite",
  JOIN: "Join",
  LEAVE: "Leave",
  LIKE: "Like",
  LISTEN: "Listen",
  MOVE: "Move",
  OFFER: "Offer",
  QUESTION: "Question",
  READ: "Read",
  REJECT: "Reject",
  REMOVE: "Remove",
  TENTATIVE_ACCEPT: "TentativeAccept",
  TENTATIVE_REJECT: "TentativeReject",
  TRAVEL: "Travel",
  UNDO: "Undo",
  UPDATE: "Update",
  VIEW: "View",
} as const;

export const CollectionTypes = {
  COLLECTION: "Collection",
  ORDERED_COLLECTION: "OrderedCollection",
} as const;

export const CollectionPageTypes = {
  COLLECTION_PAGE: "CollectionPage",
  ORDERED_COLLECTION_PAGE: "OrderedCollectionPage",
} as const;

export const CoreObjectTypes = {
  ...ObjectTypes,
  ...ActorTypes,
  ...ActivityTypes,
  ...CollectionTypes,
  ...CollectionPageTypes,
} as const;

export const AllTypes = {
  ...CoreObjectTypes,
  ...LinkTypes,
};

export type Thing = {
  // Activity Pub allows null.
  id?: string | null;
  type: typeof AllTypes[keyof typeof AllTypes];
}

// Core Object.
export interface CoreObject extends Thing {
  // Activity Streams properties.
  type: typeof CoreObjectTypes[keyof typeof CoreObjectTypes];
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
  mediaType?: string;
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

  // Activity Pub
  likes?: string | OrderedCollection;
  shares?: string | OrderedCollection;
  source?: {
    content?: StringReference;
    contentMap?: StringReferenceMap;
  };
};

// Actors.

export type Actor = CoreObject & {
  // Activity Streams properties.
  type: typeof ActorTypes[keyof typeof ActorTypes];

  // Activity Pub properties.
  inbox: string | OrderedCollection;
  outbox: string | OrderedCollection;
  following?: string | Collection;
  followers?: string | Collection;
  liked?: string | AnyCollection;
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

export type AnyActor = Application | Person | Organization | Service | Group;

export type Application = Actor & {
  type: typeof ActorTypes.APPLICATION;
};

export type Person = Actor & {
  type: typeof ActorTypes.PERSON;
};

export type Group = Actor & {
  type: typeof ActorTypes.GROUP;
};

export type Service = Actor & {
  type: typeof ActorTypes.SERVICE;
};

export type Organization = Actor & {
  type: typeof ActorTypes.ORGANIZATION;
};

// Object

export type Object = CoreObject & {
  // Activity Streams
  type: typeof ObjectTypes[keyof typeof ObjectTypes];
};

export type Tombstone = Object & {
  type: typeof ObjectTypes.TOMBSTONE,
  formerType?: typeof AllTypes[keyof typeof AllTypes] | Array<typeof AllTypes[keyof typeof AllTypes]>;
  deleted?: Date;
};

export type Relationship = Object & {
  type: typeof ObjectTypes.RELATIONSHIP,
  subject?: string | CoreObject | Link;
  object?: ObjectOrLinkReference;
  relationship?: ObjectReference;
};

export type Article = Object & {
  type: typeof ObjectTypes.ARTICLE;
};

export type Note = Object & {
  type: typeof ObjectTypes.NOTE;
};

export type Page = Object & {
  type: typeof ObjectTypes.PAGE;
};

export type Event = Object & {
  type: typeof ObjectTypes.EVENT;
};

export type Place = Object & {
  type: typeof ObjectTypes.PLACE,
  accuracy?: number;
  altitude?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
  units?: string;
};

export type Document = Object & {
  type: typeof ObjectTypes.DOCUMENT;
};

export type Image = Document & {
  type: typeof ObjectTypes.IMAGE;
};

export type Audio = Document & {
  type: typeof ObjectTypes.IMAGE;
};

export type Video = Document & {
  type: typeof ObjectTypes.IMAGE;
};

export type Profile = Object & {
  type: typeof ObjectTypes.PROFILE,
  describes?: string | CoreObject;
};

export type AnyObject = Tombstone | Relationship | Image | Page | Event | Place | Event | Page | Article | Document | Audio | Video | Note | Profile;

// Link

export interface Link extends Thing {
  type: typeof LinkTypes[keyof typeof LinkTypes];
  height?: number;
  href?: string;
  hrefLang?: string;
  mediaType?: string;
  name?: StringReference;
  nameMap?: StringReferenceMap;
  preview?: ObjectOrLinkReference;
  rel?: StringReference;
  width?: number;
};

export interface Mention extends Link {
  type: typeof LinkTypes.MENTION;
};

export type AnyLink = Link | Mention;

// Activity

export type Activity = CoreObject & {
  // Activity Streams.
  type: typeof ActivityTypes[keyof typeof ActivityTypes];
  actor: ObjectOrLinkReference;
  object?: ObjectOrLinkReference;
  target?: ObjectOrLinkReference;
  result?: ObjectOrLinkReference;
  origin?: ObjectOrLinkReference;
  instrument?: ObjectOrLinkReference;
};

export interface IntransitiveActivity extends Omit<Activity, 'object'> {};

export type Accept = Activity & {
  type: typeof ActivityTypes.ACCEPT;
};

export type TentativeAccept = Accept & {
  type: typeof ActivityTypes.TENTATIVE_ACCEPT;
};

export type Add = Activity & {
  type: typeof ActivityTypes.ADD;
};

export type Arrive = IntransitiveActivity & {
  type: typeof ActivityTypes.ARRIVE;
};

export type Create = Activity & {
  type: typeof ActivityTypes.CREATE;
};

export type Delete = Activity & {
  type: typeof ActivityTypes.DELETE;
};

export type Follow = Activity & {
  type: typeof ActivityTypes.FOLLOW;
};

export type Ignore = Activity & {
  type: typeof ActivityTypes.IGNORE;
};

export type Join = Activity & {
  type: typeof ActivityTypes.JOIN;
};


export type Leave = Activity & {
  type: typeof ActivityTypes.LEAVE;
};

export type Like = Activity & {
  type: typeof ActivityTypes.LIKE;
};

export type Offer = Activity & {
  type: typeof ActivityTypes.OFFER;
};

export type Invite = Offer & {
  type: typeof ActivityTypes.INVITE;
};

export type Reject = Activity & {
  type: typeof ActivityTypes.REJECT;
};
  
export type TentativeReject = Reject & {
  type: typeof ActivityTypes.TENTATIVE_REJECT;
};

export type Remove = Activity & {
  type: typeof ActivityTypes.REMOVE;
};

export type Undo = Activity & {
  type: typeof ActivityTypes.UNDO;
};

export type Update = Activity & {
  type: typeof ActivityTypes.UPDATE;
};

export type View = Activity & {
  type: typeof ActivityTypes.VIEW;
};

export type Listen = Activity & {
  type: typeof ActivityTypes.LISTEN;
};

export type Read = Activity & {
  type: typeof ActivityTypes.READ;
};

export type Move = Activity & {
  type: typeof ActivityTypes.MOVE;
};

export type Travel = IntransitiveActivity & {
  type: typeof ActivityTypes.TRAVEL;
};

export type Announce = Activity & {
  type: typeof ActivityTypes.ANNOUNCE;
};

export type Block = Ignore & {
  type: typeof ActivityTypes.BLOCK;
};

export type Flag = Activity & {
  type: typeof ActivityTypes.FLAG;
};

export type Dislike = Activity & {
  type: typeof ActivityTypes.DISLIKE;
};

export type Question = IntransitiveActivity & {
  type: typeof ActivityTypes.QUESTION,
  oneOf: ObjectOrLinkReference;
  anyOf: ObjectOrLinkReference;
  closed: ObjectOrLinkReference|Date|boolean;
};

export type AnyActivity =
  Accept |
  TentativeAccept |
  Add |
  Arrive |
  Create |
  Delete |
  Follow |
  Ignore |
  Join |
  Leave |
  Like |
  Invite |
  Offer |
  Reject |
  TentativeReject |
  Remove |
  Undo |
  Update |
  View |
  Listen |
  Read |
  Move |
  Travel |
  Announce |
  Block |
  Flag |
  Dislike |
  Question;

// Collections.

export type Collection = CoreObject & {
  type: typeof CollectionTypes.COLLECTION;
  totalItems?: number;
  items?: ObjectOrLinkReference;
  current?: string | CollectionPage | Link;
  first?: string | CollectionPage | Link;
  last?: string | CollectionPage | Link;
}

export type OrderedCollection = CoreObject & {
  type: typeof CollectionTypes.ORDERED_COLLECTION;
  totalItems?: number;
  items?: ObjectOrLinkReference;
  current?: string | CollectionPage | Link;
  first?: string | CollectionPage | Link;
  last?: string | CollectionPage | Link;
  orderedItems?: ObjectOrLinkReference;
};

export type AnyCollection = Collection | OrderedCollection;

export type CollectionPage = CoreObject & {
  type: typeof CollectionPageTypes[keyof typeof CollectionPageTypes];
  partOf?: string | CollectionPage | Link;
  next?: string | CollectionPage | Link;
  prev?: string | CollectionPage | Link;
  totalItems?: number;
  items?: ObjectOrLinkReference;
  current?: string | CollectionPage | Link;
  first?: string | CollectionPage | Link;
  last?: string | CollectionPage | Link;
};

export type OrderedCollectionPage = CollectionPage & {
  type: typeof CollectionPageTypes.ORDERED_COLLECTION_PAGE;
  startIndex?: number;
  orderedItems?: ObjectOrLinkReference;
};

export type AnyCollectionPage = CollectionPage | OrderedCollectionPage;

export type AnyCoreObject = AnyObject | AnyActor | AnyActivity | AnyCollection | AnyCollectionPage;

export type AnyThing = AnyCoreObject | AnyLink;

export type StringReference = string | string[];
export type StringReferenceMap = { (key: string): StringReference; }
export type ObjectReference = StringReference | AnyCoreObject | AnyCoreObject[];
export type LinkReference = StringReference | AnyLink | AnyLink[];
export type ImageReference = StringReference | Image[];
export type CollectionReference = StringReference | AnyCollection | AnyCollection[];
export type ObjectOrLinkReference = StringReference | ObjectReference | LinkReference;
export type CollectionPageReference = AnyCollectionPage | AnyCollectionPage[];
