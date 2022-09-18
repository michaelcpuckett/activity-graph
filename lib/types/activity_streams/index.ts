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
