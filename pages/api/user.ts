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
import { APActivity, APActor } from '../../lib/classes/activity_pub';
import { generateKeyPair } from '../../lib/crypto';

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

  const actor: APActor = {
    type: AP.ActorTypes.PERSON,
    name,
    preferredUsername,
    url: id,
    inbox: `${id}/inbox`,
    outbox: `${id}/outbox`,
    published: new Date(),
    "followers": `${id}/followers`,
    "following": `${id}/following`,
    "liked": `${id}/liked`,
    "streams": [
      `${id}/blocked`,
      `${id}/groups`,
    ],
    "endpoints": {
        "sharedInbox": `${LOCAL_DOMAIN}/inbox`,
    },
    "publicKey": {
        "id": `${id}}#main-key`,
        "owner": `${id}`,
        "publicKeyPem": publicKey
    },
  };

  const botServiceUrl = `${LOCAL_DOMAIN}/actor/bot`;

  const createActorActivity = new APActivity({
    type: AP.ActivityTypes.CREATE,
    actor: {
      id: botServiceUrl,
      type: AP.ActorTypes.APPLICATION,
      name: 'Bot',
      url: botServiceUrl,
      inbox: `${botServiceUrl}/inbox`,
      outbox: `${botServiceUrl}/outbox`,
    },
    object: actor,
  });

  res.status(200).json({
    success: true,
  });
}
