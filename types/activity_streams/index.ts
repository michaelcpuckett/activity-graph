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

export type StringReference = string | string[];
export type StringReferenceMap = { (key: string): StringReference; }
export type ObjectReference = StringReference | Object | Object[];
export type LinkReference = StringReference | Link | Link[];
export type ImageReference = StringReference | Image[]; 
export type CollectionReference = StringReference | Collection | Collection[];
export type ObjectOrLinkReference = StringReference | ObjectReference | LinkReference;
export type CollectionPageReference = CollectionPage | CollectionPage[];

export interface Thing {
  id?: string;
}

export interface Object extends Thing {
  type:
    typeof ObjectTypes[keyof typeof ObjectTypes] |
    typeof ActorTypes[keyof typeof ActorTypes] |
    typeof ActivityTypes[keyof typeof ActivityTypes] |
    typeof CollectionTypes[keyof typeof CollectionTypes] |
    Array<
      typeof ObjectTypes[keyof typeof ObjectTypes] |
      typeof ActorTypes[keyof typeof ActorTypes] |
      typeof ActivityTypes[keyof typeof ActivityTypes] |
      typeof CollectionTypes[keyof typeof CollectionTypes]
    >;
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

export interface Tombstone extends Object {
  type: typeof ObjectTypes.TOMBSTONE,
  formerType?: typeof ObjectTypes[keyof typeof ObjectTypes] | Array<typeof ObjectTypes[keyof typeof ObjectTypes]>;
  deleted?: Date;
};

export interface Relationship extends Object {
  type: typeof ObjectTypes.RELATIONSHIP,
  subject?: string | Object | Link;
  object?: ObjectOrLinkReference;
  relationship?: ObjectReference;
};

export interface Article extends Object {
  type: typeof ObjectTypes.ARTICLE,
};

export interface Note extends Object {
  type: typeof ObjectTypes.NOTE,
};

export interface Page extends Object {
  type: typeof ObjectTypes.PAGE,
};

export interface Event extends Object {
  type: typeof ObjectTypes.EVENT,
};

export interface Place extends Object {
  type: typeof ObjectTypes.PLACE,
  accuracy?: number;
  altitude: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
  units?: string;
};

export interface Document extends Object {
  type: typeof ObjectTypes.DOCUMENT,
};

export type Image = Document & {
  type: typeof ObjectTypes.IMAGE,
};

export type Audio = Document & {
  type: typeof ObjectTypes.IMAGE,
};

export type Video = Document & {
  type: typeof ObjectTypes.IMAGE,
};

export interface Profile extends Object {
  type: typeof ObjectTypes.PROFILE,
  describes?: string | Object;
};

export interface Link extends Thing {
  type: typeof LinkTypes[keyof typeof LinkTypes] |
    Array<typeof LinkTypes[keyof typeof LinkTypes]>;
  height?: number;
  href?: string;
  hrefLang?: string;
  mediaType?: string;
  name?: StringReference;
  preview?: ObjectOrLinkReference;
  rel?: StringReference;
  width?: number;
};

export interface Mention extends Link {
  type: typeof LinkTypes.MENTION,
};

export interface Actor extends Object {
  type: typeof ActorTypes[keyof typeof ActorTypes],
};

export interface Application extends Actor {
  type: typeof ActorTypes.APPLICATION,
};
export interface Person extends Actor {
  type: typeof ActorTypes.PERSON,
};
export interface Group extends Actor {
  type: typeof ActorTypes.GROUP,
};
export interface Service extends Actor {
  type: typeof ActorTypes.SERVICE,
};
export interface Organization extends Actor {
  type: typeof ActorTypes.ORGANIZATION,
};

export interface Activity extends Object {
  type: typeof ActivityTypes[keyof typeof ActivityTypes];
  actor?: ObjectOrLinkReference;
  object?: ObjectOrLinkReference;
  target?: ObjectOrLinkReference;
  result?: ObjectOrLinkReference;
  origin?: ObjectOrLinkReference;
  instrument?: ObjectOrLinkReference;
};

export interface IntransitiveActivity extends Omit<Activity, 'object'> {};

export interface Accept extends Activity {
  type: typeof ActivityTypes.ACCEPT,
};

export type TentativeAccept = Accept & {
  type: typeof ActivityTypes.TENTATIVE_ACCEPT,
};

export interface Add extends Activity {
  type: typeof ActivityTypes.ADD,
};

export interface Arrive extends IntransitiveActivity {
  type: typeof ActivityTypes.ARRIVE,
};

export interface Create extends Activity {
  type: typeof ActivityTypes.CREATE,
};

export interface Delete extends Activity {
  type: typeof ActivityTypes.DELETE,
};

export interface Follow extends Activity {
  type: typeof ActivityTypes.FOLLOW,
};

export interface Ignore extends Activity {
  type: typeof ActivityTypes.IGNORE,
};

export interface Join extends Activity {
  type: typeof ActivityTypes.JOIN,
};

export interface Leave extends Activity {
  type: typeof ActivityTypes.LEAVE,
};

export interface Like extends Activity {
  type: typeof ActivityTypes.LIKE,
};

export interface Offer extends Activity {
  type: typeof ActivityTypes.OFFER,
};

export type Invite = Offer & {
  type: typeof ActivityTypes.INVITE,
};

export interface Reject extends Activity {
  type: typeof ActivityTypes.REJECT,
};

export type TentativeReject = Reject & {
  type: typeof ActivityTypes.TENTATIVE_REJECT,
};

export interface Remove extends Activity {
  type: typeof ActivityTypes.REMOVE,
};

export interface Undo extends Activity {
  type: typeof ActivityTypes.UNDO,
};

export interface Update extends Activity {
  type: typeof ActivityTypes.UPDATE,
};

export interface View extends Activity {
  type: typeof ActivityTypes.VIEW,
};

export interface Listen extends Activity {
  type: typeof ActivityTypes.LISTEN,
};

export interface Read extends Activity {
  type: typeof ActivityTypes.READ,
};

export interface Move extends Activity {
  type: typeof ActivityTypes.MOVE,
};

export interface Travel extends IntransitiveActivity {
  type: typeof ActivityTypes.TRAVEL,
};

export interface Announce extends Activity {
  type: typeof ActivityTypes.ANNOUNCE,
};

export type Block = Ignore & {
  type: typeof ActivityTypes.BLOCK,
};

export interface Flag extends Activity {
  type: typeof ActivityTypes.FLAG,
};

export interface Dislike extends Activity {
  type: typeof ActivityTypes.DISLIKE,
};

export interface Question extends IntransitiveActivity {
  type: typeof ActivityTypes.QUESTION,
  oneOf: ObjectOrLinkReference;
  anyOf: ObjectOrLinkReference;
  closed: ObjectOrLinkReference|Date|boolean;
};

export interface Collection extends Object {
  type: typeof CollectionTypes[keyof typeof CollectionTypes];
  totalItems?: number;
  items?: ObjectOrLinkReference;
  current?: string | CollectionPage | Link;
  first?: string | CollectionPage | Link;
  last?: string | CollectionPage | Link;
}

export interface OrderedCollection extends Collection {
  type: typeof CollectionTypes.ORDERED_COLLECTION; 
}

export type CollectionPage = Collection & {
  type: typeof CollectionPageTypes[keyof typeof CollectionPageTypes];
  partOf: string | CollectionPage | Link;
  next: string | CollectionPage | Link;
  prev: string | CollectionPage | Link;
};

export type OrderedCollectionPage = OrderedCollection & CollectionPage & {
  type: typeof CollectionPageTypes.ORDERED_COLLECTION_PAGE;
  startIndex: number;
};
