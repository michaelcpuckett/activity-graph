import type { NextApiRequest, NextApiResponse } from 'next';
import { Graph } from 'activitypub-core/src/graph';
import { generateKeyPair, getGuid } from 'activitypub-core/src/crypto';
import { LOCAL_DOMAIN } from 'activitypub-core/src/globals';
import { AP } from 'activitypub-core/src/types';
import { PokemonClient } from 'pokenode-ts';

type Data = {
  error?: string;
  success?: boolean;
};

export default async function pokemonHandler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const graph = await Graph.connect();

  const { actor: actorId, name }: { actor: string; name: string } = JSON.parse(
    req.body,
  );

  const actor = await graph.findEntityById(new URL(actorId));

  if (
    !actor ||
    !('outbox' in actor) ||
    !('streams' in actor) ||
    !actor.streams
  ) {
    return res.status(500).send({
      error: 'No Actor with streams',
    });
  }

  let pokemonCollectionId: URL | null = null;

  for (const stream of actor.streams) {
    if (stream instanceof URL) {
      const foundStream = await graph.findEntityById(stream);

      if (foundStream) {
        if (foundStream.name === 'Pokemon') {
          pokemonCollectionId = foundStream.id ?? null;
          break;
        }
      }
    } else {
      if (stream.name === 'Pokemon') {
        pokemonCollectionId = stream.id ?? null;
        break;
      }
    }
  }

  if (!pokemonCollectionId) {
    return res.status(500).send({
      error: 'No Pokemon Collection',
    });
  }

  const { publicKey: pokemonPublicKey, privateKey: pokemonPrivateKey } =
    await generateKeyPair();

  const pokemonUsername = name;

  const pokemonId = `${LOCAL_DOMAIN}/pokemon/${getGuid()}`;

  const existingPokemon = await graph.findOne('species', {
    'pkmn:name': name.toLowerCase(),
  });

  if (!existingPokemon) {
    const api = new PokemonClient();

    const pokemonData: void | Pokemon = await api
      .getPokemonByName(name.toLowerCase())
      .catch((error) => console.error(error));
    
      const conformData = (data) => {
        const conformedData: Array<[string, unknown]> = [];

        for (const [key, value] of Object.entries({...data})) {
          if (Array.isArray(value)) {
            conformedData.push([`pkmn:${key}`, value.map(item => {
              if (item && typeof item === 'object') {
                return conformData(item);
              } else {
                return item;
              }
            })]);
          } else if (value && typeof value === 'object') {
            conformedData.push([`pkmn:${key}`, conformData(value)]);
          } else {
            conformedData.push([`pkmn:${key}`, value]);
          }
        }

        return Object.fromEntries(conformedData);
    }

    // TODO store in separate database/collection?

    const speciesData: AP.Document = {
      ...conformData(pokemonData),
      id: new URL(`${LOCAL_DOMAIN}/species/${name.toLowerCase()}`),
      url: new URL(`${LOCAL_DOMAIN}/species/${name.toLowerCase()}`),
      type: AP.ExtendedObjectTypes.DOCUMENT,
    }

    await graph.saveEntity(speciesData);
  }

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
    name: name,
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
    actor: new URL(actorId),
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
    return res.status(500).send({
      error: 'No Actor Outbox',
    });
  }

  if (!actor.streams?.length) {
    return res.status(500).send({
      error: 'No actor streams',
    });
  }

  const addPokemonActivityId = `${LOCAL_DOMAIN}/activity/${getGuid()}`;

  const addPokemonActivity: AP.Add = {
    id: new URL(addPokemonActivityId),
    url: new URL(addPokemonActivityId),
    type: AP.ActivityTypes.ADD,
    actor: new URL(actorId),
    object: new URL(pokemonId),
  };

  await Promise.all([
    graph.saveEntity(addPokemonActivity),
    graph.insertOrderedItem(actorOutboxId, new URL(createPokemonActivityId)),
    graph.insertOrderedItem(actorOutboxId, new URL(addPokemonActivityId)),
    graph.insertOrderedItem(pokemonCollectionId, new URL(pokemonId)),
  ]);

  res.status(200).send({
    success: true,
  });
}
