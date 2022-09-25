import { Graph } from ".";
import * as AP from '../types/activity_pub';
import {
  PUBLIC_ACTOR
} from '../globals';

export async function getRecipientsList(this: Graph, to: AP.ObjectOrLinkReference) {
  const toArray = Array.isArray(to) ? to : [to];
  const filteredToArray = toArray.filter(
    (recipient) => recipient !== PUBLIC_ACTOR,
  );

  return (
    await Promise.all(
      filteredToArray.map(async (reference) => {
        if (typeof reference === 'string') {
          const foundThing = await this.queryById(reference);

          console.log({
            foundThing,
          });

          if (!foundThing) {
            return null;
          }

          if (
            typeof foundThing === 'object' &&
            'inbox' in foundThing &&
            foundThing.inbox &&
            foundThing.id
          ) {
            return foundThing.id;
          }

          if (
            typeof foundThing === 'object' &&
            foundThing.type === AP.CollectionTypes.ORDERED_COLLECTION &&
            foundThing.orderedItems
          ) {
            return foundThing.orderedItems;
          }

          if (
            typeof foundThing === 'object' &&
            'items' in foundThing &&
            foundThing.items
          ) {
            return foundThing.items;
          }

          return null;
        }
        if ('id' in reference) {
          return reference.id;
        }
        if ('href' in reference) {
          return reference.href;
        }
        if (Array.isArray(reference)) {
          if (reference.every((item) => typeof item === 'string')) {
            return reference;
          } else {
            return reference.map((item) => {
              if (typeof item !== 'string' && 'id' in item) {
                return item;
              }
            });
          }
        }
      }),
    )
  ).flat();
}
