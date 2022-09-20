import type { NextApiRequest, NextApiResponse } from 'next';
import { Graph } from '../../../lib/graph';
import { CONTEXT, LOCAL_DOMAIN } from '../../../lib/globals';
import * as AP from '../../../lib/types/activity_pub';
import { APActivity, APActor } from '../../../lib/classes/activity_pub';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AP.AnyThing & {
    [CONTEXT]: string|string[];
  } | {
    error?: string;
  }>
) {
  const url = `${LOCAL_DOMAIN}${req.url}`;

  console.log(url);

  if (typeof url !== 'string') {
    return res.status(400).json({
      error: 'Could not locate thing.',
    });
  }

  const graph = await Graph.connect();

  try {
    const expandedThing = await graph.expandThing(JSON.parse(req.body));

    if ('actor' in expandedThing) {
      const activity = new APActivity(expandedThing);

      const activityId = activity.id;
      const activityActorOutboxId = activity.actor && typeof activity.actor !== 'string' && 'outbox' in activity.actor ? typeof activity.actor.outbox === 'string' ? activity.actor.outbox : activity.actor.outbox.id : '';

      if (activityActorOutboxId && activityId) {
        await Promise.all([
          graph.saveActivity(activity),
          graph.insertOrderedItem(activityActorOutboxId, activityId),
        ]);
      }

      return res.status(200).json(activity.formatPublicObject());
    } else {
      throw new Error('Actor not found.');
    }
  } catch (error) {
    console.log(error);
    return res.status(300).json({
      error: 'BAD REQUEST',
    });
  }
}