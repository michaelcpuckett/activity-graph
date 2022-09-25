import {
  APActivity,
  APActor,
  APCollection,
  APCollectionPage,
  APLink,
  APObject,
  APOrderedCollection,
} from '../classes/activity_pub';
import * as AP from '../types/activity_pub';

export const getTypedThing = (thing: AP.AnyThing) => {
  for (const linkType of Object.values(AP.LinkTypes)) {
    if (thing.type === linkType) {
      return new APLink(thing);
    }
  }

  for (const activityType of Object.values(AP.ActivityTypes)) {
    if (thing.type === activityType) {
      return new APActivity(thing);
    }
  }

  for (const actorType of Object.values(AP.ActorTypes)) {
    if (thing.type === actorType) {
      return new APActor(thing);
    }
  }

  if (thing.type === AP.CollectionTypes.COLLECTION) {
    return new APCollection(thing);
  }

  if (thing.type === AP.CollectionTypes.ORDERED_COLLECTION) {
    return new APOrderedCollection(thing);
  }

  for (const collectionPageType of Object.values(AP.CollectionPageTypes)) {
    if (thing.type === collectionPageType) {
      return new APCollectionPage(thing);
    }
  }

  for (const objectType of Object.values(AP.ObjectTypes)) {
    if (thing.type === objectType) {
      return new APObject(thing);
    }
  }

  return null;
};
