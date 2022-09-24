import type { NextApiRequest, NextApiResponse } from 'next';
import { Graph } from '../../../lib/graph';
import { CONTEXT, LOCAL_DOMAIN, PUBLIC_ACTOR } from '../../../lib/globals';
import * as AP from '../../../lib/types/activity_pub';
import { APActivity, APLink, APObject } from '../../../lib/classes/activity_pub';
import { getTypedThing } from '../../../lib/utilities/getTypedThing';
import { APThing } from '../../../lib/classes/activity_pub/thing';

async function handleFollow(activity: AP.Activity, graph: Graph, recipient: AP.Actor): Promise<void> {
  const activityObjectId = typeof activity.object === 'string' ? activity.object : (activity.object && 'id' in activity.object) ? activity.object.id : '';

  if (!activityObjectId) {
    throw new Error('Bad request 1')
  }

  const foundThing = await graph.queryById(activityObjectId);

  if (!foundThing || !foundThing.type) {
    throw new Error('bad request 2');
  }

  const typedThing = getTypedThing(foundThing);

  if (!typedThing || !('inbox' in typedThing)) {
    throw new Error('bad request 3');
  }

  if (typeof typedThing.id !== 'string') {
    throw new Error('bad request 4')
  }

  const activityActorId = typeof activity.actor === 'string' ? activity.actor : (activity.actor && 'id' in activity.actor) ? activity.actor.id : '';

  if (!activityActorId) {
    throw new Error('Bad request 1')
  }

  const foundActor = await graph.queryById(activityActorId);

  if (!foundActor || !foundActor.type) {
    throw new Error('bad request 2');
  }

  const typedActor = getTypedThing(foundActor);

  if (!typedActor || !('inbox' in typedActor)) {
    throw new Error('bad request 3');
  }

  if (typeof typedActor.id !== 'string') {
    throw new Error('bad request 4')
  }

  const follower = typedActor;
  const followee = typedThing;

  if (!(follower.id && followee.id && followee.id === recipient.id)) {
    throw new Error('bad request')
  }

  if (!activity.id) {
    throw new Error('bad request');
  }

  // Now we're in outbox, because this is auto-generated:

  const acceptActivity = new APActivity({
    type: AP.ActivityTypes.ACCEPT,
    actor: followee.id,
    object: activity.id,
    to: [
      PUBLIC_ACTOR,
      follower.id,
    ]
  });

  if (!acceptActivity.id) {
    throw new Error('bad request');
  }

  const followeeOutboxId = typeof followee.outbox === 'string' ? followee.outbox : !Array.isArray(followee.outbox) && 'id' in followee.outbox ? followee.outbox.id : '';

  if (!followeeOutboxId) {
    throw new Error('bad request');
  }
  
  const followeeFollowersId = followee.followers ? typeof followee.followers === 'string' ? followee.followers : !Array.isArray(followee.followers) && 'id' in followee.followers ? followee.followers.id : '' : '';
    
  if (!followeeFollowersId) {
    throw new Error('bad request 6');
  }

  await Promise.all([
    graph.saveThing(acceptActivity.compress()),
    graph.insertOrderedItem(followeeOutboxId, acceptActivity.id),
    graph.insertItem(followeeFollowersId, follower.id), // ugh I guesss
  ]);

  await graph.broadcastActivity(acceptActivity, followee);
}


async function handleAccept(activity: AP.Activity, graph: Graph, recipient: AP.Actor): Promise<void> {
  const activityObjectId = typeof activity.object === 'string' ? activity.object : (activity.object && 'id' in activity.object) ? activity.object.id : '';

  if (!activityObjectId) {
    throw new Error('Bad request 1')
  }

  const foundThing = await graph.queryById(activityObjectId);

  if (!foundThing || !foundThing.type) {
    throw new Error('bad request 2');
  }

  console.log(foundThing.type, 'TYPE')
  
  if (foundThing.type === AP.ActivityTypes.FOLLOW) {
    const followActivity: AP.Activity = foundThing;
    const follower = followActivity.actor;
    const followee = followActivity.object;

    if (!follower || !followee) {
      throw new Error('bad request 3');
    }

    const followerId = typeof follower === 'string' ? follower : !Array.isArray(follower) && 'id' in follower ? follower.id : '';
    const followeeId = typeof followee === 'string' ? followee : !Array.isArray(followee) && 'id' in followee ? followee.id : '';

    if (!followerId || !followeeId) {
      throw new Error('bad request 4');
    }

    const foundFollower = await graph.queryById(followerId);

    if (!foundFollower || !('outbox' in foundFollower)) {
      throw new Error('bad request 55');
    }

    const foundFollowee = await graph.queryById(followeeId);

    if (!foundFollowee || !('outbox' in foundFollowee)) {
      throw new Error('bad request 5');
    }

    const followeeFollowersId = foundFollowee.followers ? typeof foundFollowee.followers === 'string' ? foundFollowee.followers : !Array.isArray(foundFollowee.followers) && 'id' in foundFollowee.followers ? foundFollowee.followers.id : '' : '';
    
    if (!followeeFollowersId) {
      throw new Error('bad request 6');
    }

    await graph.insertItem(followeeFollowersId, followerId);

    const followerFollowingId = foundFollower.following ? typeof foundFollower.following === 'string' ? foundFollower.following : !Array.isArray(foundFollower.following) && 'id' in foundFollower.following ? foundFollower.following.id : '' : '';
    
    if (!followerFollowingId) {
      throw new Error('bad request 7');
    }

    await graph.insertItem(followerFollowingId, followeeId);

    console.log({
      followeeId,
      followerId,
    })
  }
}


async function handleLike(activity: AP.Activity, graph: Graph, recipient: AP.Actor): Promise<void> {
  if (!activity.id) {
    throw new Error('bad request; no id')
  }
  
  const activityObjectId = typeof activity.object === 'string' ? activity.object : (activity.object && 'id' in activity.object) ? activity.object.id : '';

  if (!activityObjectId) {
    throw new Error('Bad request')
  }

  const foundThing = await graph.findThingById(activityObjectId);

  if (!foundThing || !foundThing.type) {
    // Not applicable.
    return;
  }

  if (!('likes' in foundThing && foundThing.likes)) {
    throw new Error('bad request - no likes collection.')
  }

  const likesCollectionId = typeof foundThing.likes === 'string' ? foundThing.likes : foundThing.likes.id;

  if (!likesCollectionId) {
    throw new Error('bad request ; no likes collection')
  }

  const likesCollection = await graph.findThingById(likesCollectionId);

  if (!likesCollection) {
    throw new Error('bad request ;; no likes collection');
  }

  if (likesCollection.type === AP.CollectionTypes.COLLECTION) {
    await graph.insertItem(likesCollectionId, activity.id);
  } else if (likesCollection.type === AP.CollectionTypes.ORDERED_COLLECTION) {
    await graph.insertOrderedItem(likesCollectionId, activity.id);
  }
}

async function handleAnnounce(activity: AP.Activity, graph: Graph, recipient: AP.Actor): Promise<void> {
  if (!activity.id) {
    throw new Error('bad request; no id')
  }
  
  const activityObjectId = typeof activity.object === 'string' ? activity.object : (activity.object && 'id' in activity.object) ? activity.object.id : '';

  if (!activityObjectId) {
    throw new Error('Bad request')
  }

  const foundThing = await graph.findThingById(activityObjectId);

  if (!foundThing || !foundThing.type) {
    // Not applicable.
    return;
  }

  if (!('shares' in foundThing && foundThing.shares)) {
    throw new Error('bad request - no shares collection.')
  }

  const sharesCollectionId = typeof foundThing.shares === 'string' ? foundThing.shares : foundThing.shares.id;

  if (!sharesCollectionId) {
    throw new Error('bad request ; no shares collection')
  }

  const sharesCollection = await graph.findThingById(sharesCollectionId);

  if (!sharesCollection) {
    throw new Error('bad request ;; no shares collection');
  }

  if (sharesCollection.type === AP.CollectionTypes.COLLECTION) {
    await graph.insertItem(sharesCollectionId, activity.id);
  } else if (sharesCollection.type === AP.CollectionTypes.ORDERED_COLLECTION) {
    await graph.insertOrderedItem(sharesCollectionId, activity.id);
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
    const actorId = typeof activity.actor === 'string' ? activity.actor : !Array.isArray(activity.actor) ? activity.actor.id : '';

    if (!actorId) {
      throw new Error('no actor');
    }

    if (actorId === recipient.id) {
      throw new Error('lol dont send to self')
    }

    activity.published = new Date();
    const activityId = activity.id;
    const recipientInboxId = recipient && 'inbox' in recipient && recipient.inbox ? typeof recipient.inbox === 'string' ? recipient.inbox : !Array.isArray(recipient.inbox) ? recipient.inbox.id : '' : '';

    if (!(recipientInboxId && activityId)) {
      throw new Error('Bad request')
    }

    // Run side effects.
    switch (activity.type) {
      case AP.ActivityTypes.FOLLOW: await handleFollow(activity, graph, recipient);
      break;
      case AP.ActivityTypes.ACCEPT: await handleAccept(activity, graph, recipient);
      break;
      case AP.ActivityTypes.LIKE: await handleLike(activity, graph, recipient);
      break;
      case AP.ActivityTypes.ANNOUNCE: await handleAnnounce(activity, graph, recipient);
      break;
    }

    await graph.saveThing(activity.compress());
    await graph.insertOrderedItem(recipientInboxId, activityId);

    return res.status(200).json(activity.formatPublicObject());
  } catch (error) {
    console.log(error);
    return res.status(300).json({
      error: 'BAD REQUEST',
    });
  }
}