import { generateKeyPair, getGuid } from 'activitypub-core/src/crypto';
import { LOCAL_DOMAIN, SERVER_ACTOR_ID } from 'activitypub-core/src/globals';
import { Graph } from 'activitypub-core/src/graph';
import { AP } from 'activitypub-core/src/types';

export async function arriveAtLocation(location: AP.Place, actor: AP.Actor, graph: Graph) {
  if (
    !actor ||
    !actor.id ||
    !('outbox' in actor) ||
    !('streams' in actor) ||
    !actor.streams
  ) {
    throw new Error('bad actor');
  }

  if (!location || !location.id) {
    throw new Error('Bad location');
  }

  let visitedCollectionId: URL | null = null;

  for (const stream of actor.streams) {
    if (stream instanceof URL) {
      const foundStream = await graph.findEntityById(stream);

      if (foundStream) {
        if (foundStream.name === 'Visited') {
          visitedCollectionId = foundStream.id ?? null;
        }
      }
    } else {
      if (stream.name === 'Visited') {
        visitedCollectionId = stream.id ?? null;
      }
    }
  }

  if (!visitedCollectionId) {
    throw new Error('No visited collection')
  }

  const visitedCollection = await graph.findEntityById(visitedCollectionId);

  if (!visitedCollection || visitedCollection.type !== AP.CollectionTypes.ORDERED_COLLECTION || !visitedCollection.orderedItems || !Array.isArray(visitedCollection.orderedItems)) {
    throw new Error('bad collection');
  }

  const [ origin ] = Array.isArray(visitedCollection.orderedItems) ? visitedCollection.orderedItems : [];

  const originId = origin ? (origin instanceof URL ? origin : origin.id) : null;

  const arriveActivityId = `${LOCAL_DOMAIN}/activity/${getGuid()}`;

  const arriveActivity: AP.Arrive = {
    id: new URL(arriveActivityId),
    url: new URL(arriveActivityId),
    type: AP.ActivityTypes.ARRIVE,
    actor: actor.id,
    location: location.id,
    ...originId ? {
      origin: originId,
    } : null,
  };

  const actorOutboxId = actor.outbox instanceof URL ? actor.outbox : actor.outbox.id;

  if (!actorOutboxId) {
    throw new Error('No outbox');
  }

  console.log('INSERTING')

  await Promise.all([
    graph.saveEntity(arriveActivity),
    graph.insertOrderedItem(actorOutboxId, new URL(arriveActivityId)),
    graph.insertOrderedItem(visitedCollectionId, location.id),
  ]);
}