import { generateKeyPair, getGuid } from 'activitypub-core/src/crypto';
import { LOCAL_DOMAIN, SERVER_ACTOR_ID } from 'activitypub-core/src/globals';
import { Graph } from 'activitypub-core/src/graph';
import { AP } from 'activitypub-core/src/types';
import { Pokemon, PokemonClient } from 'pokenode-ts';
import { cacheSpecies } from './cacheSpecies';
import { prefixPkmnData } from './prefixPkmnData';
import { unprefixPkmnData } from './unprefixPkmnData';

export async function catchPokemon(speciesName: string, actor: AP.Actor, graph: Graph) {
  if (
    !actor ||
    !actor.id ||
    !('outbox' in actor) ||
    !('streams' in actor) ||
    !actor.streams
  ) {
    throw new Error('Bad actor.')
  }

  
  let pokemonCollectionId: URL | null = null;

  for (const stream of actor.streams) {
    if (stream instanceof URL) {
      const foundStream = await graph.findEntityById(stream);

      if (foundStream) {
        if (foundStream.name === 'Pokemon') {
          pokemonCollectionId = foundStream.id ?? null;
        }
      }
    } else {
      if (stream.name === 'Pokemon') {
        pokemonCollectionId = stream.id ?? null;
      }
    }
  }

  if (!pokemonCollectionId) {
    throw new Error('No Pokemon Collection')
  }

  const { publicKey: pokemonPublicKey, privateKey: pokemonPrivateKey } =
    await generateKeyPair();

  const pokemonUsername = speciesName.toLowerCase();

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

  const existingSpecies = await cacheSpecies(speciesName, graph);

  if (!existingSpecies) {
    throw new Error('Species not found')
  }

  const pokemon: AP.Application & {
    [key: string]: unknown
  } = {
    id: new URL(pokemonId),
    url: new URL(pokemonId),
    type: AP.ActorTypes.APPLICATION,
    name: speciesName,
    'poke:species': speciesName.toLowerCase(),
    preferredUsername: speciesName,
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
    'poke:experience': existingSpecies.base_experience * 5
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

  const actorOutboxId =
    actor.outbox instanceof URL ? actor.outbox : actor.outbox.id;

  if (!actorOutboxId) {
    throw new Error('No actor outbox')
  }

  const addPokemonActivityId = `${LOCAL_DOMAIN}/activity/${getGuid()}`;

  const addPokemonActivity: AP.Add = {
    id: new URL(addPokemonActivityId),
    url: new URL(addPokemonActivityId),
    type: AP.ActivityTypes.ADD,
    actor: actor.id,
    object: new URL(pokemonId),
    target: pokemonCollectionId,
  };

  await Promise.all([
    graph.insertOrderedItem(pokemonCollectionId, new URL(pokemonId)),
    graph.saveEntity(addPokemonActivity),
    graph.insertOrderedItem(
      new URL(`${SERVER_ACTOR_ID}/outbox`),
      new URL(createPokemonActivityId),
    ),
    graph.insertOrderedItem(actorOutboxId, new URL(addPokemonActivityId)),
  ])
}