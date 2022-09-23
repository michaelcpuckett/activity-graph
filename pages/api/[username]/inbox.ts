import type { NextApiRequest, NextApiResponse } from 'next';
import { Graph } from '../../../lib/graph';
import { CONTEXT, LOCAL_DOMAIN } from '../../../lib/globals';
import * as AP from '../../../lib/types/activity_pub';
import { APActivity, APLink, APObject } from '../../../lib/classes/activity_pub';
import { getTypedThing } from '../../../lib/utilities/getTypedThing';
import { APThing } from '../../../lib/classes/activity_pub/thing';

async function handleCreate(activity: AP.Activity, graph: Graph, actor: AP.Actor, recipient: AP.Actor): Promise<string> {
  if (!(activity.object && typeof activity.object !== 'string' && !Array.isArray(activity.object))) {
    // TODO
    throw new Error('bad request')
  }

  const activityObjectId = typeof activity.object === 'string' ? activity.object : (activity.object && 'id' in activity.object) ? activity.object.id : '';

  if (!activityObjectId) {
    throw new Error('Bad request')
  }

  const foundThing = await graph.findThingById(activityObjectId);

  if (!foundThing || !foundThing.type) {
    throw new Error('bad request');
  }

  const typedThing = getTypedThing(foundThing);

  if (!typedThing) {
    throw new Error('bad request');
  }

  if (typedThing.id !== 'string') {
    throw new Error('bad request')
  }

  await Promise.all([
    graph.saveThing(typedThing.compress()),
  ]);

  return typedThing.id;
}

async function handleFollow(activity: AP.Activity, graph: Graph, actor: AP.Actor, recipient: AP.Actor): Promise<void> {
  if (!(activity.object && typeof activity.object !== 'string' && !Array.isArray(activity.object))) {
    // TODO
    throw new Error('bad request')
  }

  const activityObjectId = typeof activity.object === 'string' ? activity.object : (activity.object && 'id' in activity.object) ? activity.object.id : '';

  if (!activityObjectId) {
    throw new Error('Bad request')
  }

  const foundThing = await graph.findThingById(activityObjectId);

  if (!foundThing || !foundThing.type) {
    throw new Error('bad request');
  }

  const typedThing = getTypedThing(foundThing);

  if (!typedThing || !('inbox' in typedThing)) {
    throw new Error('bad request');
  }

  if (typedThing.id !== 'string') {
    throw new Error('bad request')
  }

  const follower = actor;
  const followee = typedThing;

  if (followee.id === recipient.id) {
    console.log('MATCH')
  }
}

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
  
    const graph = await Graph.connect();

    try {
      const recipient = await graph.findOne('actor', {
        inbox: url,
      });

      if (!recipient || !recipient.id || !('inbox' in recipient)) {
        throw new Error('Bad request');
      }

      const thing = JSON.parse(req.body);
  
      if (!('actor' in thing)) {
        throw new Error('bad request');
      }
  
      const activity = new APActivity(thing);
  
      console.log(activity);
  
      activity.published = new Date();
      const activityId = activity.id;
      const activityActorId = activity.actor ? (typeof activity.actor === 'string' ? activity.actor : !Array.isArray(activity.actor) ? activity.actor.id : '') : '';
  
      if (!activityActorId) {
        throw new Error('No actor ID.');
      }
  
      const actor = await graph.findThingById(activityActorId);
  
      if (!actor || !('inbox' in actor)) {
        throw new Error('No actor.');
      }
  
      const actorInboxId = actor && 'inbox' in actor && actor.inbox ? typeof actor.inbox === 'string' ? actor.inbox : !Array.isArray(actor.inbox) ? actor.inbox.id : '' : '';
  
      if (!(actorInboxId && activityId)) {
        throw new Error('Bad request')
      }
  
      // Run side effects.
      switch (activity.type) {
        case AP.ActivityTypes.CREATE: activity.object = await handleCreate(activity, graph, actor, recipient);
        break;
        case AP.ActivityTypes.FOLLOW: await handleFollow(activity, graph, actor, recipient);
        break;
      }
  
      await graph.saveThing(activity.compress());
      await graph.insertOrderedItem(actorInboxId, activityId);
  
      return res.status(200).json(activity.formatPublicObject());
    } catch (error) {
      console.log(error);
      return res.status(300).json({
        error: 'BAD REQUEST',
      });
    }
  }