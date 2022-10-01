import type { NextApiRequest, NextApiResponse } from 'next';
import { Graph } from 'activitypub-core/src/graph';
import * as firebaseAdmin from 'firebase-admin';
import { AppOptions } from 'firebase-admin';
import serviceAccount from '../../credentials';
import { LOCAL_DOMAIN, RESERVED_USERNAMES } from 'activitypub-core/src/globals';
import { AP } from 'activitypub-core/src/types';
import { generateKeyPair } from 'activitypub-core/src/crypto';

type Data = {
  error?: string;
  success?: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const graph = await Graph.connect();

  const { email, password, name, preferredUsername } = JSON.parse(req.body);

  const isUsernameTaken = !!(await graph.findOne('actor', {
    preferredUsername,
  }));

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
      projectId: 'socialweb-id',
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

  const { publicKey, privateKey } = await generateKeyPair();

  const id = `${LOCAL_DOMAIN}/actor/${preferredUsername}`;

  const botServiceUsername = 'bot';
  const botServiceId = `${LOCAL_DOMAIN}/actor/${botServiceUsername}`;
  const isBotCreated = !!(await graph.findOne('actor', {
    preferredUsername: botServiceUsername,
  }));

  if (!isBotCreated) {
    const { publicKey: botPublicKey, privateKey: botPrivateKey } =
      await generateKeyPair();

    const botInbox: AP.OrderedCollection = {
      id: new URL(`${botServiceId}/inbox`),
      url: new URL(`${botServiceId}/inbox`),
      type: AP.CollectionTypes.ORDERED_COLLECTION,
      totalItems: 0,
      orderedItems: [],
    };

    const botOutbox: AP.OrderedCollection = {
      id: new URL(`${botServiceId}/outbox`),
      url: new URL(`${botServiceId}/outbox`),
      type: AP.CollectionTypes.ORDERED_COLLECTION,
      totalItems: 0,
      orderedItems: [],
    };

    const botFollowers: AP.Collection = {
      id: new URL(`${botServiceId}/followers`),
      url: new URL(`${botServiceId}/followers`),
      name: 'Followers',
      type: AP.CollectionTypes.COLLECTION,
      totalItems: 0,
      items: [],
    };

    const botFollowing: AP.Collection = {
      id: new URL(`${botServiceId}/following`),
      url: new URL(`${botServiceId}/following`),
      name: 'Following',
      type: AP.CollectionTypes.COLLECTION,
      totalItems: 0,
      items: [],
    };

    const botActor: AP.Actor = {
      id: new URL(botServiceId),
      url: new URL(botServiceId),
      type: AP.ActorTypes.APPLICATION,
      name: botServiceUsername,
      preferredUsername: botServiceUsername,
      inbox: botInbox,
      outbox: botOutbox,
      following: botFollowing,
      followers: botFollowers,
      endpoints: {
        sharedInbox: `${LOCAL_DOMAIN}/inbox`,
      },
      publicKey: {
        id: `${id}#main-key`,
        owner: id,
        publicKeyPem: botPublicKey,
      },
    };

    await Promise.all([
      graph.saveEntity(botActor),
      graph.saveEntity(botInbox),
      graph.saveEntity(botOutbox),
      graph.saveEntity(botFollowing),
      graph.saveEntity(botFollowers),
      graph.saveString('username', 'bot', 'bot'),
      graph.saveString('private-key', 'bot', botPrivateKey),
    ]);
  }

  const userInbox: AP.OrderedCollection = {
    id: new URL(`${id}/inbox`),
    url: new URL(`${id}/inbox`),
    name: 'Inbox',
    type: AP.CollectionTypes.ORDERED_COLLECTION,
    totalItems: 0,
    orderedItems: [],
  };

  const userOutbox: AP.OrderedCollection = {
    id: new URL(`${id}/outbox`),
    url: new URL(`${id}/outbox`),
    name: 'Outbox',
    type: AP.CollectionTypes.ORDERED_COLLECTION,
    totalItems: 0,
    orderedItems: [],
  };

  const userFollowers: AP.Collection = {
    id: new URL(`${id}/followers`),
    url: new URL(`${id}/followers`),
    name: 'Followers',
    type: AP.CollectionTypes.COLLECTION,
    totalItems: 0,
    items: [],
  };

  const userFollowing: AP.Collection = {
    id: new URL(`${id}/following`),
    url: new URL(`${id}/following`),
    name: 'Following',
    type: AP.CollectionTypes.COLLECTION,
    totalItems: 0,
    items: [],
  };

  const userLiked: AP.OrderedCollection = {
    id: new URL(`${id}/liked`),
    url: new URL(`${id}/liked`),
    name: 'Liked',
    type: AP.CollectionTypes.ORDERED_COLLECTION,
    totalItems: 0,
    orderedItems: [],
  };

  const userShared: AP.OrderedCollection = {
    id: new URL(`${id}/shared`),
    url: new URL(`${id}/shared`),
    name: 'Shared',
    type: AP.CollectionTypes.ORDERED_COLLECTION,
    totalItems: 0,
    orderedItems: [],
  };

  const userBlocked: AP.Collection = {
    id: new URL(`${id}/blocked`),
    url: new URL(`${id}/blocked`),
    name: 'Blocked',
    type: AP.CollectionTypes.COLLECTION,
    totalItems: 0,
    items: [],
  };

  const userGroups: AP.Collection = {
    id: new URL(`${id}/groups`),
    url: new URL(`${id}/groups`),
    name: 'Groups',
    type: AP.CollectionTypes.COLLECTION,
    totalItems: 0,
    items: [],
  };

  const userLikes: AP.OrderedCollection = {
    id: new URL(`${id}/likes`),
    url: new URL(`${id}/likes`),
    name: 'Likes',
    type: AP.CollectionTypes.ORDERED_COLLECTION,
    totalItems: 0,
    orderedItems: [],
  };

  const userShares: AP.OrderedCollection = {
    id: new URL(`${id}/shares`),
    url: new URL(`${id}/shares`),
    name: 'Shares',
    type: AP.CollectionTypes.ORDERED_COLLECTION,
    totalItems: 0,
    orderedItems: [],
  };

  const userBookmarks: AP.OrderedCollection = {
    id: new URL(`${id}/bookmarks`),
    url: new URL(`${id}/bookmarks`),
    name: 'Bookmarks',
    type: AP.CollectionTypes.ORDERED_COLLECTION,
    totalItems: 0,
    orderedItems: [],
  };

  const userActor: AP.Actor = {
    id: new URL(id),
    url: new URL(id),
    type: AP.ActorTypes.PERSON,
    name,
    preferredUsername,
    inbox: userInbox,
    outbox: userOutbox,
    published: new Date(),
    followers: userFollowers,
    following: userFollowing,
    liked: userLiked,
    likes: userLikes,
    shares: userShares,
    streams: [userShared, userBlocked, userGroups, userBookmarks],
    endpoints: {
      sharedInbox: `${LOCAL_DOMAIN}/inbox`,
    },
    publicKey: {
      id: `${id}#main-key`,
      owner: id,
      publicKeyPem: publicKey,
    },
  };

  const createActorActivity: AP.Create = {
    type: AP.ActivityTypes.CREATE,
    actor: new URL(botServiceId),
    object: userActor,
  };

  await Promise.all([
    graph.saveEntity(graph.compressEntity(createActorActivity)),
    graph.saveEntity(graph.compressEntity(userActor)),
    graph.saveEntity(userInbox),
    graph.saveEntity(userOutbox),
    graph.saveEntity(userLiked),
    graph.saveEntity(userLikes),
    graph.saveEntity(userShares),
    graph.saveEntity(userFollowers),
    graph.saveEntity(userFollowing),
    graph.saveEntity(userShared),
    graph.saveEntity(userBlocked),
    graph.saveEntity(userGroups),
    graph.saveEntity(userBookmarks),
    graph.saveString('account', user.uid, email),
    graph.saveString('private-key', user.uid, privateKey),
    graph.saveString('username', user.uid, preferredUsername),
  ]);

  const friendsGroupId = `${id}/groups/friends`;

  const friendsGroupInbox: AP.OrderedCollection = {
    id: new URL(`${friendsGroupId}/inbox`),
    url: new URL(`${friendsGroupId}/inbox`),
    name: 'Inbox',
    type: AP.CollectionTypes.ORDERED_COLLECTION,
    totalItems: 0,
    orderedItems: [],
  };

  const friendsGroupOutbox: AP.OrderedCollection = {
    id: new URL(`${friendsGroupId}/outbox`),
    url: new URL(`${friendsGroupId}/outbox`),
    name: 'Outbox',
    type: AP.CollectionTypes.ORDERED_COLLECTION,
    totalItems: 0,
    orderedItems: [],
  };

  const friendsGroupLikes: AP.OrderedCollection = {
    id: new URL(`${friendsGroupId}/likes`),
    url: new URL(`${friendsGroupId}/likes`),
    name: 'Likes',
    type: AP.CollectionTypes.ORDERED_COLLECTION,
    totalItems: 0,
    orderedItems: [],
  };

  const friendsGroupShares: AP.OrderedCollection = {
    id: new URL(`${friendsGroupId}/shares`),
    url: new URL(`${friendsGroupId}/shares`),
    name: 'Shares',
    type: AP.CollectionTypes.ORDERED_COLLECTION,
    totalItems: 0,
    orderedItems: [],
  };

  const friendsGroupMembers: AP.Collection = {
    id: new URL(`${friendsGroupId}/members`),
    url: new URL(`${friendsGroupId}/members`),
    name: 'Members',
    type: AP.CollectionTypes.COLLECTION,
    totalItems: 0,
    items: [],
  };

  const friendsGroupActor: AP.Actor = {
    id: new URL(friendsGroupId),
    url: new URL(friendsGroupId),
    type: AP.ActorTypes.GROUP,
    name: 'Friends',
    inbox: friendsGroupInbox,
    outbox: friendsGroupOutbox,
    published: new Date(),
    likes: friendsGroupLikes,
    shares: friendsGroupShares,
    streams: [
      friendsGroupMembers, // TODO. Or relationships instead of all this?
    ],
    endpoints: {
      sharedInbox: `${LOCAL_DOMAIN}/inbox`,
    },
  };

  const createFriendsGroupActorActivity: AP.Create = {
    type: AP.ActivityTypes.CREATE,
    actor: new URL(botServiceId),
    object: friendsGroupActor,
  };

  await Promise.all([
    graph.saveEntity(graph.compressEntity(friendsGroupActor)),
    graph.saveEntity(friendsGroupInbox),
    graph.saveEntity(friendsGroupOutbox),
    graph.saveEntity(friendsGroupLikes),
    graph.saveEntity(friendsGroupShares),
    graph.saveEntity(friendsGroupMembers),
    graph.saveEntity(graph.compressEntity(createFriendsGroupActorActivity)),
  ]);

  if (userGroups.id) {
    await Promise.all([graph.insertItem(userGroups.id, new URL(friendsGroupId))]);
  }

  if (createFriendsGroupActorActivity.id && friendsGroupInbox.id) {
    await Promise.all([
      graph.insertOrderedItem(
        new URL(`${botServiceId}/outbox`),
        createFriendsGroupActorActivity.id,
      ),
      graph.insertOrderedItem(
        friendsGroupInbox.id,
        createFriendsGroupActorActivity.id,
      ),
    ]);
  }

  if (createActorActivity.id && userInbox.id) {
    await Promise.all([
      graph.insertOrderedItem(new URL(`${botServiceId}/outbox`), createActorActivity.id),
      graph.insertOrderedItem(userInbox.id, createActorActivity.id),
    ]);
  }

  res.status(200).json({
    success: true,
  });
}
