import type { NextApiRequest, NextApiResponse } from 'next';
import { Graph } from 'activitypub-core/src/graph';
import { catchPokemon } from '../../utilities/catchPokemon';

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
    name: speciesName
  }: {
    actor: string;
    name: string;
  } = JSON.parse(req.body);

  const actor = await graph.findEntityById(new URL(actorId));

  if (!actor || !('outbox' in actor)) {
    return res.status(500).send({
      error: 'Bad actor',
    });
  }

  try {
    await catchPokemon(speciesName, actor, graph);
  } catch (error) {
    return res.status(500).send({
      error: String(error),
    });
  }

  res.status(200).send({
    success: true,
  });
}
