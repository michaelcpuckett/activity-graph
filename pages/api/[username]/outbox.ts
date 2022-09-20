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

      switch (activity.type) {
        case AP.ActivityTypes.DELETE: {
          const activityObjectId = typeof activity.object === 'string' ? activity.object : (activity.object && 'id' in activity.object) ? activity.object.id : '';

          if (!activityObjectId) {
            throw new Error('Bad request')
          }

          const objectToDelete = await graph.findThingById(activityObjectId);

          if (!objectToDelete || !objectToDelete.type) {
            throw new Error('bad request');
          }

          activity.object = {
            id: activityObjectId,
            url: activityObjectId,
            type: AP.ObjectTypes.TOMBSTONE,
            deleted: new Date(),
            formerType: objectToDelete.type,
          };
        }
        break;
        default: {

        }
      }

      if (activityActorOutboxId && activityId) {
        await graph.saveActivity(activity);
        await graph.insertOrderedItem(activityActorOutboxId, activityId);
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