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

  const isUsernameTaken = !!(await graph.getActorByPreferredUsername(preferredUsername));
  
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

  const actor = new APActor({
    id,
    url: id,
    type: AP.ActorTypes.PERSON,
    name,
    preferredUsername,
    inbox: new APOrderedCollection({
      id: `${id}/inbox`,
      url: `${id}/inbox`,
      type: AP.CollectionTypes.ORDERED_COLLECTION,
      totalItems: 0,
      orderedItems: []
    }),
    outbox: new APOrderedCollection({
      id: `${id}/outbox`,
      url: `${id}/outbox`,
      type: AP.CollectionTypes.ORDERED_COLLECTION,
      totalItems: 0,
      orderedItems: [],
    }),
    published: new Date(),
    followers: new APCollection({
      id: `${id}/followers`,
      url: `${id}/followers`,
      type: AP.CollectionTypes.COLLECTION,
      totalItems: 0,
      items: [],
    }),
    following: new APCollection({
      id: `${id}/following`,
      url: `${id}/following`,
      type: AP.CollectionTypes.COLLECTION,
      totalItems: 0,
      items: [],
    }),
    liked: new APOrderedCollection({
      id: `${id}/liked`,
      url: `${id}/liked`,
      type: AP.CollectionTypes.ORDERED_COLLECTION,
      totalItems: 0,
      orderedItems: [],
    }),
    "streams": [
      new APCollection({
        id: `${id}/blocked`,
        url: `${id}/blocked`,
        type: AP.CollectionTypes.COLLECTION,
        totalItems: 0,
        items: [],
      }),
      new APCollection({
        id: `${id}/groups`,
        url: `${id}/groups`,
        type: AP.CollectionTypes.COLLECTION,
        totalItems: 0,
        items: [],
      }),
    ],
    "endpoints": {
      "sharedInbox": `${LOCAL_DOMAIN}/inbox`,
    },
    "publicKey": {
        "id": `${id}}#main-key`,
        "owner": `${id}`,
        "publicKeyPem": publicKey
    },
  });

  const botServiceUrl = `${LOCAL_DOMAIN}/actor/bot`;

  const createActorActivity = new APActivity({
    type: AP.ActivityTypes.CREATE,
    actor: new APActor({
      id: botServiceUrl,
      url: botServiceUrl,
      type: AP.ActorTypes.APPLICATION,
      name: 'Bot',
      inbox: new APOrderedCollection({
        id: `${botServiceUrl}/inbox`,
        url: `${botServiceUrl}/inbox`,
        type: AP.CollectionTypes.ORDERED_COLLECTION,
        totalItems: 0,
        orderedItems: []
      }),
      outbox: new APOrderedCollection({
        id: `${botServiceUrl}/outbox`,
        url: `${botServiceUrl}/outbox`,
        type: AP.CollectionTypes.ORDERED_COLLECTION,
        totalItems: 0,
        orderedItems: [],
      }),
    }),
    object: actor,
  });

  await graph.saveActivity(createActorActivity);

  const createFriendsGroupActivity = new APActivity({
    type: AP.ActivityTypes.CREATE,
    actor: id,
    object: new APActor({
      type: AP.ActorTypes.GROUP,
      name: 'Friends',
      id: `${id}/groups/friends`,
      url: `${id}/groups/friends`,
      inbox: new APOrderedCollection({
        id: `${id}/groups/friends/inbox`,
        url: `${id}/groups/friends/inbox`,
        type: AP.CollectionTypes.ORDERED_COLLECTION,
        totalItems: 0,
        orderedItems: []
      }),
      outbox: new APOrderedCollection({
        id: `${id}/groups/friends/outbox`,
        url: `${id}/groups/friends/outbox`,
        type: AP.CollectionTypes.ORDERED_COLLECTION,
        totalItems: 0,
        orderedItems: [],
      }),
    }),
  });

  await graph.saveActivity(createFriendsGroupActivity);

  await Promise.all([
    // graph.saveString(`${LOCAL_DOMAIN}/account/${user.uid}`, email),
    // graph.saveString(`${LOCAL_DOMAIN}/private-key/${user.uid}`, privateKey),
    // graph.saveString(`${LOCAL_DOMAIN}/username/${user.uid}`, preferredUsername),
  ]);

  res.status(200).json({
    success: true,
  });
}
