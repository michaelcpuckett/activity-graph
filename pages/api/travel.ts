import type { NextApiRequest, NextApiResponse } from 'next';
import { Graph } from 'activitypub-core/src/graph';
import { generateKeyPair, getGuid } from 'activitypub-core/src/crypto';
import {
  LOCAL_DOMAIN,
  LOCAL_HOSTNAME,
  PORT,
  PROTOCOL,
  SERVER_ACTOR_ID,
} from 'activitypub-core/src/globals';
import { AP } from 'activitypub-core/src/types';

type Data = {
  error?: string;
  success?: boolean;
};

export default async function startHandler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const graph = await Graph.connect();

  const { actor: actorId, location }: { actor: string; location: string } =
    JSON.parse(req.body);

  const actor = await graph.findEntityById(new URL(actorId));

  if (
    !actor ||
    !actor.id ||
    !('outbox' in actor) ||
    !Array.isArray(actor.streams)
  ) {
    throw new Error('No actor');
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
    throw new Error('No visited collection.');
  }

  const visitedCollection = await graph.findEntityById(visitedCollectionId);

  if (
    !(
      visitedCollection &&
      visitedCollection.type === AP.CollectionTypes.ORDERED_COLLECTION &&
      Array.isArray(visitedCollection.orderedItems)
    )
  ) {
    throw new Error('Not visited collection');
  }

  const origin = visitedCollection.orderedItems[0];

  if (!origin) {
    throw new Error('No origin');
  }

  const originId = origin instanceof URL ? origin : origin.id;

  if (!originId) {
    throw new Error('no origin URL');
  }

  const arriveActivityId = `${PROTOCOL}//${LOCAL_HOSTNAME}${
    PORT ? `:${PORT}` : ''
  }/activity/${getGuid()}`;

  const arriveActivity: AP.Arrive = {
    id: new URL(arriveActivityId),
    url: new URL(arriveActivityId),
    type: AP.ActivityTypes.ARRIVE,
    actor: actor.id,
    location: new URL(location),
    origin: originId,
  };

  const actorOutboxId =
    actor.outbox instanceof URL ? actor.outbox : actor.outbox.id;

  if (!actorOutboxId) {
    return res.status(500).send({
      error: 'No Actor Outbox',
    });
  }

  await Promise.all([
    graph.saveEntity(arriveActivity),
    graph.insertOrderedItem(actorOutboxId, new URL(arriveActivityId)),
    graph.insertOrderedItem(visitedCollectionId, new URL(location)),
  ]);

  res.status(200).send({
    success: true,
  });
}
