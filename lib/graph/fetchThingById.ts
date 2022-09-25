import { Graph } from ".";
import * as AP from '../types/activity_pub';
import {
  ACCEPT_HEADER,
  ACTIVITYSTREAMS_CONTENT_TYPE,
  CONTENT_TYPE_HEADER,
} from '../globals';
import { getTypedThing } from "../utilities/getTypedThing";

export async function fetchThingById(this: Graph, id: string): Promise<AP.AnyThing | null> {
  // GET requests (eg. to the inbox) MUST be made with an Accept header of
  // `application/ld+json; profile="https://www.w3.org/ns/activitystreams"`
  const fetchedThing = await fetch(id, {
    headers: {
      [CONTENT_TYPE_HEADER]: ACTIVITYSTREAMS_CONTENT_TYPE,
      [ACCEPT_HEADER]: ACTIVITYSTREAMS_CONTENT_TYPE,
    },
  })
    .then(async (response) => await response.json())
    .catch((error) => {
      console.log(error);
      return null;
    });

  if (
    !(
      typeof fetchedThing === 'object' &&
      fetchedThing &&
      'type' in fetchedThing
    )
  ) {
    return null;
  }

  const thing = fetchedThing as AP.AnyThing;

  const typedThing = getTypedThing(thing);

  if (!typedThing) {
    return null;
  }

  const compressedThing = typedThing.compress();

  // TODO Turn on smarter caching.
  // await this.saveThing(compressedThing);

  return compressedThing;
}