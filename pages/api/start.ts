import type { NextApiRequest, NextApiResponse } from 'next';
import { Graph } from 'activitypub-core/src/graph';
import { generateKeyPair, getGuid } from 'activitypub-core/src/crypto';
import { LOCAL_DOMAIN, SERVER_ACTOR_ID } from 'activitypub-core/src/globals';
import { AP } from 'activitypub-core/src/types';

type Data = {
  error?: string;
  success?: boolean;
};

export default async function startHandler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const graph = await Graph.connect();

  const { actor: actorId, starterPokemon, startingLocation }: { actor: string; starterPokemon: string; startingLocation: string; } = JSON.parse(req.body);

  const actor = await graph.findEntityById(new URL(actorId));

  if (!actor || !('outbox' in actor) || !('streams' in actor) || !actor.streams) {
    return res.status(500).send({
      error: 'No Actor with streams',
    });
  }

  let pokemonCollectionId: URL | null = null;
  let visitedCollectionId: URL | null = null;
  
  for (const stream of actor.streams) {
    if (stream instanceof URL) {
      const foundStream = await graph.findEntityById(stream);

      if (foundStream) {
        if (foundStream.name === 'Pokemon') {
          pokemonCollectionId = foundStream.id ?? null;
        }
        if (foundStream.name === 'Visited') {
          visitedCollectionId = foundStream.id ?? null;
        }
      }
    } else {
      if (stream.name === 'Pokemon') {
        pokemonCollectionId = stream.id ?? null;
      }
      
      if (stream.name === 'Visited') {
        visitedCollectionId = stream.id ?? null;
      }
    }
  }

  if (!pokemonCollectionId) {
    return res.status(500).send({
      error: 'No Pokemon Collection',
    });
  }

  if (!visitedCollectionId) {
    return res.status(500).send({
      error: 'No Visited Collection',
    });
  }

  const { publicKey: pokemonPublicKey, privateKey: pokemonPrivateKey } =
  await generateKeyPair();

  const pokemonUsername = starterPokemon;

  const pokemonId = `${LOCAL_DOMAIN}/pokemon/${getGuid()}`;

  const pokemonInbox: AP.OrderedCollection = {
    id: new URL(`${pokemonId}/inbox`),
    url: new URL(`${pokemonId}/inbox`),
    type: AP.CollectionTypes.ORDERED_COLLECTION,
    totalItems: 0,
    orderedItems: [],
  };

  const pokemonOutbox: AP.OrderedCollection = {
    id: new URL(`${pokemonId}/outbox`),
    url: new URL(`${pokemonId}/outbox`),
    type: AP.CollectionTypes.ORDERED_COLLECTION,
    totalItems: 0,
    orderedItems: [],
  };

  const pokemonFollowers: AP.Collection = {
    id: new URL(`${pokemonId}/followers`),
    url: new URL(`${pokemonId}/followers`),
    name: 'Followers',
    type: AP.CollectionTypes.COLLECTION,
    totalItems: 0,
    items: [],
  };

  const pokemonFollowing: AP.Collection = {
    id: new URL(`${pokemonId}/following`),
    url: new URL(`${pokemonId}/following`),
    name: 'Following',
    type: AP.CollectionTypes.COLLECTION,
    totalItems: 0,
    items: [],
  };

  const pokemon: AP.Application = {
    id: new URL(pokemonId),
    url: new URL(pokemonId),
    type: AP.ActorTypes.APPLICATION,
    name: starterPokemon,
    preferredUsername: pokemonUsername,
    inbox: pokemonInbox,
    outbox: pokemonOutbox,
    following: pokemonFollowing,
    followers: pokemonFollowers,
    endpoints: {
      sharedInbox: `${LOCAL_DOMAIN}/inbox`,
    },
    publicKey: {
      id: `${pokemonId}#main-key`,
      owner: pokemonId,
      publicKeyPem: pokemonPublicKey,
    },
  };

  const createPokemonActivityId = `${LOCAL_DOMAIN}/activity/${getGuid()}`;

  const createPokemonActivity: AP.Create = {
    id: new URL(createPokemonActivityId),
    url: new URL(createPokemonActivityId),
    type: AP.ActivityTypes.CREATE,
    actor: new URL(SERVER_ACTOR_ID),
    object: new URL(pokemonId),
  };

  await Promise.all([
    graph.saveEntity(pokemon),
    graph.saveEntity(pokemonInbox),
    graph.saveEntity(pokemonOutbox),
    graph.saveEntity(pokemonFollowing),
    graph.saveEntity(pokemonFollowers),
    graph.saveEntity(createPokemonActivity),
    graph.saveString('username', pokemonUsername, pokemonUsername),
    graph.saveString('private-key', pokemonUsername, pokemonPrivateKey),
  ]);

  const actorOutboxId = actor.outbox instanceof URL ? actor.outbox : actor.outbox.id;
  
  if (!actorOutboxId) {
    return res.status(500).send({
      error: 'No Actor Outbox',
    });
  }

  const addPokemonActivityId = `${LOCAL_DOMAIN}/activity/${getGuid()}`;

  const addPokemonActivity: AP.Add = {
    id: new URL(addPokemonActivityId),
    url: new URL(addPokemonActivityId),
    type: AP.ActivityTypes.ADD,
    actor: new URL(actorId),
    object: new URL(pokemonId),
    target: pokemonCollectionId,
  };

  const arriveActivityId = `${LOCAL_DOMAIN}/activity/${getGuid()}`;

  const arriveActivity: AP.Arrive = {
    id: new URL(arriveActivityId),
    url: new URL(arriveActivityId),
    type: AP.ActivityTypes.ARRIVE,
    actor: new URL(actorId),
    location: new URL(startingLocation),
  };

  await Promise.all([
    graph.saveEntity(addPokemonActivity),
    graph.saveEntity(arriveActivity),
    graph.insertOrderedItem(new URL(`${SERVER_ACTOR_ID}/outbox`), new URL(createPokemonActivityId)),
    graph.insertOrderedItem(actorOutboxId, new URL(addPokemonActivityId)),
    graph.insertOrderedItem(actorOutboxId, new URL(arriveActivityId)),
    graph.insertOrderedItem(pokemonCollectionId, new URL(pokemonId)),
    graph.insertOrderedItem(visitedCollectionId, new URL(startingLocation)),
  ]);

  res.status(200).send({
    success: true
  });
}