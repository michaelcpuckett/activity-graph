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
import { arriveAtLocation } from '../../utilities/arriveAtLocation';

type Data = {
  error?: string;
  success?: boolean;
};

export default async function startHandler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const graph = await Graph.connect();

  const { actor: actorId, location: locationId }: { actor: string; location: string } =
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

  const location = await graph.findEntityById(new URL(locationId));

  if (!location || location.type !== AP.ExtendedObjectTypes.PLACE) {
    throw new Error('No location');
  }

  await arriveAtLocation(location, actor, graph);

  res.status(200).send({
    success: true,
  });
}
