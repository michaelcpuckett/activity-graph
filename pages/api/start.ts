import type { NextApiRequest, NextApiResponse } from 'next';
import { Graph } from 'activitypub-core/src/graph';
import { catchPokemon } from '../../utilities/catchPokemon';
import { arriveAtLocation } from '../../utilities/arriveAtLocation';
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

  const {
    actor: actorId,
    starterPokemon,
    startingLocation,
  }: {
    actor: string;
    starterPokemon: string;
    startingLocation: string;
  } = JSON.parse(req.body);

  const actor = await graph.findEntityById(new URL(actorId));

  if (!actor || !('outbox' in actor)) {
    return res.status(500).send({
      error: 'Bad actor',
    });
  }

  
  const location = await graph.findEntityById(new URL(startingLocation));

  if (!location || location.type !== AP.ExtendedObjectTypes.PLACE) {
    throw new Error('No location');
  }

  try {
    await catchPokemon(starterPokemon, actor, graph);
    await arriveAtLocation(location, actor, graph);
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      error: String(error),
    });
  }

  res.status(200).send({
    success: true,
  });
}
