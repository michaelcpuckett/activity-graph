export { PORT } from '../config';
import { PORT } from '../config';

export const LOCAL_HOSTNAME = 'localhost';
export const LOCAL_DOMAIN = `http://${LOCAL_HOSTNAME}:${PORT}`;
export const ERROR = 'error';
export const CONTEXT = '@context';
export const ACTIVITYSTREAMS_CONTEXT = 'https://www.w3.org/ns/activitystreams';
export const W3ID_SECURITY_CONTEXT = 'https://w3id.org/security/v1';
export const RELATIONSHIP_CONTEXT = 'http://purl.org/vocab/relationship/';
export const CHANGESET_CONTEXT = 'http://purl.org/vocab/changeset/schema#';
export const PUBLIC_ACTOR = `${ACTIVITYSTREAMS_CONTEXT}#Public`;
export const LINKED_DATA_CONTENT_TYPE = 'application/ld+json';
export const SERVER_ACTOR_USERNAME = 'bot';

export const SHARED_INBOX_URL = `${LOCAL_DOMAIN}/inbox`;
export const ACCEPT_HEADER = 'Accept';
export const CONTENT_TYPE_HEADER = 'Content-Type';
export const ACTIVITYSTREAMS_CONTENT_TYPE_WITH_PROFILE = `${LINKED_DATA_CONTENT_TYPE}; profile="${ACTIVITYSTREAMS_CONTEXT}"`;
export const ACTIVITYSTREAMS_CONTENT_TYPE = 'application/activity+json';
export const JSON_CONTENT_TYPE = 'application/json';
export const HTML_CONTENT_TYPE = 'text/html';
export const BLANK_JSON_RESPONSE = {
  [CONTEXT]: ACTIVITYSTREAMS_CONTEXT,
};
export const BLANK_RESPONSE = '';
export const FORBIDDEN_403_RESPONSE = {
  [ERROR]: 'Forbidden.',
};
export const ERROR_404_RESPONSE = {
  [ERROR]: 'Not found.',
};
export const SERVER_ERROR_500_RESPONSE = {
  [ERROR]: 'Internal server error.',
};
export const NOT_IMPLEMENTED_501_RESPONSE = {
  [ERROR]: 'Not implemented.',
};
export const BAD_REQUEST_400_RESPONSE = {
  [ERROR]: 'Bad request.',
};
export const ACTOR_TYPES = [
  'Application',
  'Group',
  'Organization',
  'Person',
  'Service',
];
export const ACTIVITY_TYPES = [
  'Accept',
  'Add',
  'Announce',
  'Arrive',
  'Block',
  'Create',
  'Delete',
  'Dislike',
  'Flag',
  'Follow',
  'Ignore',
  'Invite',
  'Join',
  'Leave',
  'Like',
  'Listen',
  'Move',
  'Offer',
  'Question',
  'Reject',
  'Read',
  'Remove',
  'TentativeReject',
  'TentativeAccept',
  'Travel',
  'Undo',
  'Update',
  'View',
];
export const OBJECT_TYPES = [
  'Article',
  'Audio',
  'Document',
  'Event',
  'Image',
  'Note',
  'Page',
  'Place',
  'Profile',
  'Relationship',
  'Tombstone',
  'Video',
];
export const USERNAME_REGEXP = /^[\w\d]{3,12}$/;
export const RESERVED_USERNAMES = [
  SERVER_ACTOR_USERNAME,
  'test',
  'user',
  'users',
  'account',
  'activity',
  'actor',
  'collection',
  'inbox',
  'outbox',
  'sharedInbox',
  'object',
  '404',
  'error',
  'api',
  'dashboard',
  'home',
  'settings',
  'help',
];
export const RELATIONSHIP_TYPES = {
  'Acquaintance Of': `acquaintanceOf`, // A person having more than slight or superficial knowledge of this person but short of friendship
  'Ambivalent Of': `ambivalentOf`, //  person towards whom this person has mixed feelings or emotions
  'Ancestor Of': `ancestorOf`, // A person who is a descendant of this person
  'Antagonist Of': `antagonistOf`, // A person who opposes and contends against this person
  'Apprentice To': `apprenticeTo`, // A person to whom this person serves as a trusted counselor or teacher
  'Child Of': `childOf`, // A person who was given birth to or nurtured and raised by this person
  'Close Friend Of': `closeFriendOf`, // A person who shares a close mutual friendship with this person
  'Collaborates With': `collaboratesWith`, // A person who works towards a common goal with this person
  'Colleague Of': `colleagueOf`, // A person who is a member of the same profession as this person
  'Descendant Of': `descendantOf`, // A person from whom this person is descended
  'Employed By': `employedBy`, // A person for whom this person's services have been engaged
  'Employer Of': `employerOf`, // A person who engages the services of this person
  'Enemy Of': `enemyOf`, // A person towards whom this person feels hatred, intends injury to, or opposes the interests of
  'Engaged To': `engagedTo`, // A person to whom this person is betrothed
  'Friend Of': `friendOf`, // A person who shares mutual friendship with this person
  'Grandchild Of': `grandchildOf`, // A person who is a child of any of this person's children
  'Grandparent Of': `grandparentOf`, // A person who is the parent of any of this person's parents
  'Has Met': `hasMet`, // A person who has met this person whether in passing or longer
  'Influenced By': `influencedBy`, // a person who has influenced this person
  'Knows By Reputation': `knowsByReputation`, // A person known by this person primarily for a particular action, position or field of endeavour
  'Knows In Passing': `knowsInPassing`, // A person whom this person has slight or superficial knowledge of
  'Knows Of': `knowsOf`, // A person who has come to be known to this person through their actions or position
  'Life Partner of': `lifePartnerOf`, // A person who has made a long-term commitment to this person's
  'Lives With': `livesWith`, // A person who shares a residence with this person
  'Lost Contact With': `lostContactWith`, // A person who was once known by this person but has subsequently become uncontactable
  'Mentor Of': `mentorOf`, // A person who serves as a trusted counselor or teacher to this person
  'Neighbor Of': `neighborOf`, // A person who lives in the same locality as this person
  'Parent Of': `parentOf`, // A person who has given birth to or nurtured and raised this person
  Participant: `participant`, //
  'Participant In': `participantIn`, //
  'Sibling Of': `siblingOf`, // A person having one or both parents in common with this person
  'Spouse Of': `spouseOf`, // A person who is married to this person
  'Works With': `worksWith`, // A person who works for the same employer as this person
  'Would Like To Know': `wouldLikeToKnow`, // A person whom this person would desire to know more closely
};
