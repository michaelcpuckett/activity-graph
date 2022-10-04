import { LOCAL_DOMAIN } from "activitypub-core/src/globals";
import { Graph } from "activitypub-core/src/graph";
import { AP } from "activitypub-core/src/types";
import { Pokemon, PokemonClient } from "pokenode-ts";
import { prefixPkmnData } from "./prefixPkmnData";
import { unprefixPkmnData } from "./unprefixPkmnData";

export async function cacheSpecies(speciesName: string, graph: Graph) {  
  let existingSpecies: (AP.Document & Pokemon) | null = await graph.findOne('species', {
    'poke:name': speciesName.toLowerCase(),
  }) as (AP.Document & Pokemon);

  if (!existingSpecies) {
    const api = new PokemonClient();

    const apiData: void | Pokemon = await api
      .getPokemonByName(speciesName.toLowerCase())
      .catch((error) => console.error(error));
    
    // TODO store in separate database/collection?

    if (!apiData) {
      return;
    }

    const speciesData: AP.Document = {
      ...prefixPkmnData(JSON.parse(JSON.stringify(apiData)) as unknown as { [key: string]: unknown }),
      id: new URL(`${LOCAL_DOMAIN}/species/${speciesName.toLowerCase()}`),
      url: new URL(`${LOCAL_DOMAIN}/species/${speciesName.toLowerCase()}`),
      type: AP.ExtendedObjectTypes.DOCUMENT,
    };

    await graph.saveEntity(speciesData);

    existingSpecies = unprefixPkmnData(speciesData as unknown as { [key: string]: unknown }) as unknown as (AP.Document & Pokemon);
  } else {
    existingSpecies = unprefixPkmnData(existingSpecies as unknown as { [key: string]: unknown }) as unknown as AP.Document & Pokemon;
  }

  return existingSpecies;
}