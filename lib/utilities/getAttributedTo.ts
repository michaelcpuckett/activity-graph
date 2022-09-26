import * as AP from '../types/activity_pub';
import { Graph } from '../graph';

export async function getAttributedTo(attributedTo?: AP.ObjectOrLinkReference) {
  const graph = await Graph.connect();

  if (typeof attributedTo === 'string') {
    const foundThing = await graph.findThingById(attributedTo);

    if (!foundThing) {
      return '';
    }

    for (const actorType of Object.values(AP.ActorTypes)) {
      if (foundThing.type === actorType) {
        return foundThing;
      }
    }

    return '';
  }

  return '';
}
