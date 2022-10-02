import serviceAccount from '../../credentials';
import userHandler from 'activitypub-core/src/endpoints/user';
import { AP } from 'activitypub-core/src/types';
import { Graph } from 'activitypub-core/src/graph';
import { LOCAL_DOMAIN } from 'activitypub-core/src/globals';

export default userHandler(serviceAccount, async (actor: AP.Actor, graph: Graph) => {
  if (!actor.id) {
    return;
  }

  const pokemonCollectionId = `${LOCAL_DOMAIN}/actor/${actor.preferredUsername}/pokemon`;
  const pokemonCollection: AP.Collection = {
    id: new URL(pokemonCollectionId),
    url: new URL(pokemonCollectionId),
    type: AP.CollectionTypes.ORDERED_COLLECTION,
    name: 'Pokemon',
    totalItems: 0,
    orderedItems: [],
  };

  if (actor.streams) {
    actor.streams.push(new URL(pokemonCollectionId));
  } else {
    actor.streams = [new URL(pokemonCollectionId)];
  }

  await Promise.all([
    graph.saveEntity(pokemonCollection),
    graph.saveEntity(actor),
  ]);
});
