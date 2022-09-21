import type { NextApiRequest, NextApiResponse } from 'next';
import { Graph } from '../../../lib/graph';
import { CONTEXT, LOCAL_DOMAIN } from '../../../lib/globals';
import * as AP from '../../../lib/types/activity_pub';
import { APActivity, APActor } from '../../../lib/classes/activity_pub';
import { getTypedThing } from '../../../lib/utilities/getTypedThing';
import { APCoreObject } from '../../../lib/classes/activity_pub/core_object';

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
    const thing = JSON.parse(req.body);

    if ('actor' in thing) {
      const activity = new APActivity(thing);

      const activityId = activity.id;
      const activityActorId = activity.actor ? (typeof activity.actor === 'string' ? activity.actor : !Array.isArray(activity.actor) ? activity.actor.id : '') : '';

      if (!activityActorId) {
        throw new Error('No actor ID.');
      }

      const actor = await graph.findThingById(activityActorId);

      if (!actor) {
        throw new Error('No actor.');
      }

      switch (activity.type) {
        case AP.ActivityTypes.CREATE: {
          if (activity.object && typeof activity.object !== 'string' && !Array.isArray(activity.object)) {
            const typedThing = getTypedThing(activity.object);

            if (!typedThing) {
              throw new Error('Bad request.')
            }
            activity.object = typedThing.compress();
          }
        }
        break;
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
          if (activity.object && typeof activity.object !== 'string' && !Array.isArray(activity.object) && activity.object.id) {
            activity.object = activity.object.id;
          }
        }
      }

      const actorOutboxId = actor && 'outbox' in actor && actor.outbox ? typeof actor.outbox === 'string' ? actor.outbox : !Array.isArray(actor.outbox) ? actor.outbox.id : '' : '';

      if (actorOutboxId && activityId) {
        await graph.saveThing(activity.compress());
        await graph.insertOrderedItem(actorOutboxId, activityId);
      }

      const activityObject = (activity.object && typeof activity.object !== 'string' && !Array.isArray(activity.object)) ? activity.object : null;

      if (activityObject) {
        await graph.saveThing(activityObject);
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