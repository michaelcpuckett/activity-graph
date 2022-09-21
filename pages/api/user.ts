// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from 'next';
import { Graph } from '../../lib/graph';
import * as firebaseAdmin from 'firebase-admin';
import { AppOptions } from 'firebase-admin';
import serviceAccount from '../../credentials';
import {
  LOCAL_DOMAIN
} from '../../lib/globals';
import * as AP from '../../lib/types/activity_pub'
import { APActivity, APActor, APCollection, APObject } from '../../lib/classes/activity_pub';
import { generateKeyPair } from '../../lib/crypto';
import { APOrderedCollection } from '../../lib/classes/activity_pub/collection';

type Data = {
  error?: string;
  success?: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const graph = await Graph.connect();

  const {
    email,
    password,
    name,
    preferredUsername,
  } = JSON.parse(req.body);

  const isUsernameTaken = !!(await graph.findOne('actor', { preferredUsername }));
  
  const RESERVED_USERNAMES = [
    'owner',
    'bot',
    'test',
    'user',
    'users',
    'account',
    'object', // Object URLs
    'inbox', // SharedInbox
    '404',
    'error', // Error
    'dashboard',
    'settings',
    'help',
  ];

  if (isUsernameTaken || RESERVED_USERNAMES.includes(preferredUsername)) {
    return res
      .status(409) // conflict
      .send({
        error: 'Username taken.',
      });
  }
  
  if (!firebaseAdmin.apps.length) {
    const appOptions: AppOptions = {
      credential: firebaseAdmin.credential.cert(serviceAccount),
      projectId: "socialweb-id",
    };

    firebaseAdmin.initializeApp(appOptions);
  }

  const user = await firebaseAdmin.auth().createUser({
      email,
      emailVerified: false,
      password,
      displayName: preferredUsername,
      disabled: false,
  });

  const {
    publicKey,
    privateKey,
  } = await generateKeyPair();

  const id = `${LOCAL_DOMAIN}/actor/${preferredUsername}`;

  const botServiceUsername = 'bot';
  const botServiceId = `${LOCAL_DOMAIN}/actor/${botServiceUsername}`;
  const isBotCreated = !!(await graph.findOne('actor', { preferredUsername: botServiceUsername }));

  if (!isBotCreated) {
    const botInbox: AP.OrderedCollection = {
      id: `${botServiceId}/inbox`,
      url: `${botServiceId}/inbox`,
      type: AP.CollectionTypes.ORDERED_COLLECTION,
      totalItems: 0,
      orderedItems: []
    };

    const botOutbox: AP.OrderedCollection = {
      id: `${botServiceId}/outbox`,
      url: `${botServiceId}/outbox`,
      type: AP.CollectionTypes.ORDERED_COLLECTION,
      totalItems: 0,
      orderedItems: [],
    };

    const botActor = new APActor({
      id: botServiceId,
      url: botServiceId,
      type: AP.ActorTypes.APPLICATION,
      name: botServiceUsername,
      preferredUsername: botServiceUsername,
      inbox: botInbox,
      outbox: botOutbox,
    }).compress();

    await Promise.all([
      graph.saveThing(botActor),
      graph.saveThing(botInbox),
      graph.saveThing(botOutbox),
    ]);
  }

  const userInbox: AP.OrderedCollection = {
    id: `${id}/inbox`,
    url: `${id}/inbox`,
    name: 'Inbox',
    type: AP.CollectionTypes.ORDERED_COLLECTION,
    totalItems: 0,
    orderedItems: []
  };

  const userOutbox: AP.OrderedCollection = {
    id: `${id}/outbox`,
    url: `${id}/outbox`,
    name: 'Outbox',
    type: AP.CollectionTypes.ORDERED_COLLECTION,
    totalItems: 0,
    orderedItems: [],
  };

  const userFollowers: AP.Collection = {
    id: `${id}/followers`,
    url: `${id}/followers`,
    name: 'Followers',
    type: AP.CollectionTypes.COLLECTION,
    totalItems: 0,
    items: [],
  };

  const userFollowing: AP.Collection = {
    id: `${id}/following`,
    url: `${id}/following`,
    name: 'Following',
    type: AP.CollectionTypes.COLLECTION,
    totalItems: 0,
    items: [],
  };

  const userLiked: AP.OrderedCollection = {
    id: `${id}/liked`,
    url: `${id}/liked`,
    name: 'Liked',
    type: AP.CollectionTypes.ORDERED_COLLECTION,
    totalItems: 0,
    orderedItems: [],
  };

  const userShared: AP.OrderedCollection = {
    id: `${id}/shared`,
    url: `${id}/shared`,
    name: 'Shared',
    type: AP.CollectionTypes.ORDERED_COLLECTION,
    totalItems: 0,
    orderedItems: [],
  };

  const userBlocked: AP.Collection = {
    id: `${id}/blocked`,
    url: `${id}/blocked`,
    name: 'Blocked',
    type: AP.CollectionTypes.COLLECTION,
    totalItems: 0,
    items: [],
  };

  const userGroups: AP.Collection = {
    id: `${id}/groups`,
    url: `${id}/groups`,
    name: 'Groups',
    type: AP.CollectionTypes.COLLECTION,
    totalItems: 0,
    items: [],
  };

  const userActor = new APActor({
    id,
    url: id,
    type: AP.ActorTypes.PERSON,
    name,
    preferredUsername,
    inbox: userInbox,
    outbox: userOutbox,
    published: new Date(),
    followers: userFollowers,
    following: userFollowing,
    liked: userLiked,
    streams: [userShared, userBlocked, userGroups],
    endpoints: {
      sharedInbox: `${LOCAL_DOMAIN}/inbox`,
    },
    publicKey: {
        id: `${id}#main-key`,
        owner: id,
        publicKeyPem: publicKey
    },
  }).compress();

  const createActorActivity = new APActivity({
    type: AP.ActivityTypes.CREATE,
    actor: botServiceId,
    object: userActor,
  }).compress();

  await Promise.all([
    graph.saveThing(createActorActivity),
    graph.saveThing(userActor),
    graph.saveThing(userInbox),
    graph.saveThing(userOutbox),
    graph.saveThing(userLiked),
    graph.saveThing(userFollowers),
    graph.saveThing(userFollowing),
    graph.saveThing(userShared),
    graph.saveThing(userBlocked),
    graph.saveThing(userGroups),
    graph.saveString('account', user.uid, email),
    graph.saveString('private-key', user.uid, privateKey),
    graph.saveString('username', user.uid, preferredUsername),
  ]);

  if (createActorActivity.id && userInbox.id) {
    await Promise.all([
      graph.insertOrderedItem(`${botServiceId}/outbox`, createActorActivity.id),
      graph.insertOrderedItem(userInbox.id, createActorActivity.id),
    ]);
  }

  res.status(200).json({
    success: true,
  });
}
