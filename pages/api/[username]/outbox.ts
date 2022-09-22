import type { NextApiRequest, NextApiResponse } from 'next';
import { Graph } from '../../../lib/graph';
import { CONTEXT, LOCAL_DOMAIN } from '../../../lib/globals';
import * as AP from '../../../lib/types/activity_pub';
import { APActivity, APLink, APObject } from '../../../lib/classes/activity_pub';
import { getTypedThing } from '../../../lib/utilities/getTypedThing';

async function handleCreate(activity: AP.Activity, graph: Graph, actor: AP.Actor) {
  if (!(activity.object && typeof activity.object !== 'string' && !Array.isArray(activity.object))) {
    throw new Error('bad request')
  }
  const object = getTypedThing(activity.object);

  if (!object) {
    throw new Error('Bad request.');
  }

  if (!('id' in object)) {
    throw new Error('Bad request')
  }

  const objectLikes: AP.OrderedCollection = {
    id: `${object.id}/likes`,
    url: `${object.id}/likes`,
    name: 'Likes',
    type: AP.CollectionTypes.ORDERED_COLLECTION,
    totalItems: 0,
    orderedItems: [],
  };

  const objectShares: AP.OrderedCollection = {
    id: `${object.id}/shares`,
    url: `${object.id}/shares`,
    name: 'Shares',
    type: AP.CollectionTypes.ORDERED_COLLECTION,
    totalItems: 0,
    orderedItems: [],
  };

  if (!('id' in object) || !object.id) {
    throw new Error('Bad request');
  }

  if (object instanceof APLink) {
    throw new Error('Bad request')
  }

  object.likes = objectLikes;
  object.shares = objectShares;

  await Promise.all([
    graph.saveThing(object.compress()),
    graph.saveThing(objectLikes),
    graph.saveThing(objectShares),
  ]);

  return object.id;
}

async function handleDelete(activity: AP.Activity, graph: Graph, actor: AP.Actor) {
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
  
  await graph.saveThing(activity.object);
}

async function handleUpdate(activity: AP.Activity, graph: Graph, actor: AP.Actor) {
  if (typeof activity.object !== 'object' || Array.isArray(activity.object)) {
    throw new Error('bad request');
  }

  const activityObjectId = typeof activity.object === 'string' ? activity.object : (activity.object && 'id' in activity.object) ? activity.object.id : '';

  if (!activityObjectId) {
    throw new Error('Bad request')
  }

  const objectToUpdate = await graph.findThingById(activityObjectId);

  if (!objectToUpdate || !objectToUpdate.type) {
    throw new Error('bad request');
  }

  activity.object = {
    ...objectToUpdate,
    ...activity.object,
  };

  await graph.saveThing(activity.object);
}

async function handleAdd(activity: AP.Activity, graph: Graph, actor: AP.Actor) {
  const activityObjectId = typeof activity.object === 'string' ? activity.object : (activity.object && 'id' in activity.object) ? activity.object.id : '';

  if (!activityObjectId) {
    throw new Error('Bad request 1');
  }

  if (!activity.target) {
    throw new Error('Must have target.')
  }

  const activityTargetId = typeof activity.target === 'string' ? activity.target : (activity.target && 'id' in activity.target) ? activity.target.id : '';

  if (!activityTargetId) {
    throw new Error('Bad request 2')
  }
  
  await graph.insertOrderedItem(activityTargetId, activityObjectId);
}

async function handleRemove(activity: AP.Activity, graph: Graph, actor: AP.Actor) {
  const activityObjectId = typeof activity.object === 'string' ? activity.object : (activity.object && 'id' in activity.object) ? activity.object.id : '';

  if (!activityObjectId) {
    throw new Error('Bad request 1');
  }

  if (!activity.target) {
    throw new Error('Must have target.')
  }

  const activityTargetId = typeof activity.target === 'string' ? activity.target : (activity.target && 'id' in activity.target) ? activity.target.id : '';

  if (!activityTargetId) {
    throw new Error('Bad request 2')
  }
  
  await graph.removeOrderedItem(activityTargetId, activityObjectId);
}

async function handleLike(activity: AP.Activity, graph: Graph, actor: AP.Actor) {
  const activityObjectId = typeof activity.object === 'string' ? activity.object : (activity.object && 'id' in activity.object) ? activity.object.id : '';

  if (!activityObjectId) {
    throw new Error('Bad request 1');
  }

  const object = await graph.findThingById(activityObjectId);

  if (!object) {
    throw new Error('Bad request 2')
  }

  if (!('id' in object) || !object.id) {
    throw new Error('Bad request 3')
  }

  if (!('likes' in object) || !object.likes) {
    throw new Error('Bad request 4');
  }

  const objectLikesId = typeof object.likes === 'string' ? object.likes : object.likes.id;

  if (!objectLikesId) {
    throw new Error('Bad request 5');
  }

  if (!activity.id) {
    throw new Error('Bad request 6')
  }

  await graph.insertOrderedItem(objectLikesId, activity.id);

  if (!('liked' in actor) || !actor.liked) {
    throw new Error('bad request 9');
  }

  const actorLikedId = typeof actor.liked === 'string' ? actor.liked : actor.liked.id;

  if (!actorLikedId) {
    throw new Error('bad request 10');
  }

  await graph.insertOrderedItem(actorLikedId, object.id);
}

async function handleAnnounce(activity: AP.Activity, graph: Graph, actor: AP.Actor) {
  const activityObjectId = typeof activity.object === 'string' ? activity.object : (activity.object && 'id' in activity.object) ? activity.object.id : '';

  if (!activityObjectId) {
    throw new Error('Bad request 1');
  }

  const object = await graph.findThingById(activityObjectId);

  if (!object) {
    throw new Error('Bad request 2')
  }

  if (!('id' in object) || !object.id) {
    throw new Error('Bad request 3')
  }

  if (!('shares' in object) || !object.shares) {
    throw new Error('Bad request 4');
  }

  const objectSharesId = typeof object.shares === 'string' ? object.shares : object.shares.id;

  if (!objectSharesId) {
    throw new Error('Bad request 5');
  }

  if (!activity.id) {
    throw new Error('Bad request 6')
  }

  await graph.insertOrderedItem(objectSharesId, activity.id);

  if (!('streams' in actor) || !actor.streams || !Array.isArray(actor.streams)) {
    throw new Error('bad request 9');
  }

  const actorStreams = await Promise.all(actor.streams.map(stream => typeof stream === 'string' ? stream : stream.id).map(async id => id ? await graph.findThingById(id) : null));
 
  const actorSharedCollection = actorStreams.find(stream => {
    if (stream && 'name' in stream) {
      if (stream.name === 'Shared') {
        return true;
      }
    }
  });

  if (!actorSharedCollection || !actorSharedCollection.id) {
    throw new Error('bad request');
  }

  await graph.insertOrderedItem(actorSharedCollection.id, object.id);
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

  if (typeof url !== 'string') {
    return res.status(400).json({
      error: 'Could not locate thing.',
    });
  }

  const graph = await Graph.connect();

  try {
    const thing = JSON.parse(req.body);

    if (!('actor' in thing)) {
      throw new Error('bad request');
    }

    const activity = new APActivity(thing);
    const activityId = activity.id;
    const activityActorId = activity.actor ? (typeof activity.actor === 'string' ? activity.actor : !Array.isArray(activity.actor) ? activity.actor.id : '') : '';

    if (!activityActorId) {
      throw new Error('No actor ID.');
    }

    const actor = await graph.findThingById(activityActorId);

    if (!actor || !('inbox' in actor)) {
      throw new Error('No actor.');
    }

    const actorOutboxId = actor && 'outbox' in actor && actor.outbox ? typeof actor.outbox === 'string' ? actor.outbox : !Array.isArray(actor.outbox) ? actor.outbox.id : '' : '';

    if (!(actorOutboxId && activityId)) {
      throw new Error('Bad request')
    }

    // Run side effects.
    switch (activity.type) {
      case AP.ActivityTypes.CREATE: activity.object = await handleCreate(activity, graph, actor);
      break;
      case AP.ActivityTypes.DELETE: await handleDelete(activity, graph, actor);
      break;
      case AP.ActivityTypes.UPDATE: await handleUpdate(activity, graph, actor);
      break;
      case AP.ActivityTypes.LIKE: await handleLike(activity, graph, actor);
      break;
      case AP.ActivityTypes.ANNOUNCE: await handleAnnounce(activity, graph, actor);
      break;
      case AP.ActivityTypes.ADD: await handleAdd(activity, graph, actor);
      break;
      case AP.ActivityTypes.REMOVE: await handleRemove(activity, graph, actor);
      break;
    }

    await graph.saveThing(activity.compress());
    await graph.insertOrderedItem(actorOutboxId, activityId);

    return res.status(200).json(activity.formatPublicObject());
  } catch (error) {
    console.log(error);
    return res.status(300).json({
      error: 'BAD REQUEST',
    });
  }
}