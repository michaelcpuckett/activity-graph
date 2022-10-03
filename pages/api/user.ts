import serviceAccount from '../../credentials';
import userHandler from 'activitypub-core/src/endpoints/user';
import { AP } from 'activitypub-core/src/types';
import { Graph } from 'activitypub-core/src/graph';
import { LOCAL_HOSTNAME, PORT, PROTOCOL } from 'activitypub-core/src/globals';
import { allLocations } from '../../utilities/locations';

export default userHandler(serviceAccount, async (actor: AP.Actor, graph: Graph) => {
  if (!actor.id) {
    return;
  }

  const pokemonCollectionId = `${PROTOCOL}//${LOCAL_HOSTNAME}${PORT ? `:${PORT}` : ''}/actor/${actor.preferredUsername}/pokemon`;
  const pokemonCollection: AP.OrderedCollection = {
    id: new URL(pokemonCollectionId),
    url: new URL(pokemonCollectionId),
    type: AP.CollectionTypes.ORDERED_COLLECTION,
    name: 'Pokemon',
    totalItems: 0,
    orderedItems: [],
  };

  const visitedCollectionId = `${PROTOCOL}//${LOCAL_HOSTNAME}${PORT ? `:${PORT}` : ''}/actor/${actor.preferredUsername}/visited`;
  const visitedCollection: AP.OrderedCollection = {
    id: new URL(visitedCollectionId),
    url: new URL(visitedCollectionId),
    type: AP.CollectionTypes.ORDERED_COLLECTION,
    name: 'Visited',
    totalItems: 0,
    orderedItems: [],
  };

  if (actor.streams) {
    actor.streams.push(new URL(pokemonCollectionId));
    actor.streams.push(new URL(visitedCollectionId));
  } else {
    actor.streams = [new URL(pokemonCollectionId), new URL(visitedCollectionId)];
  }

  const locations = await graph.findAll('object', {
    type: AP.ExtendedObjectTypes.PLACE,
  });

  if (!locations?.length) {
    await Promise.all(allLocations.map(async (location: AP.Place) => {
      await graph.saveEntity(location);
    }));
  }

  await Promise.all([
    graph.saveEntity(pokemonCollection),
    graph.saveEntity(visitedCollection),
    graph.saveEntity(actor),
  ]);
});
