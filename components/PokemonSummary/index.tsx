import { ChangeEvent, ChangeEventHandler, FormEvent, FormEventHandler, MouseEventHandler, ReactElement, useState } from 'react';
import { AP } from 'activitypub-core/src/types';
import { ACCEPT_HEADER, ACTIVITYSTREAMS_CONTENT_TYPE, LOCAL_DOMAIN, LOCAL_HOSTNAME, PORT, PROTOCOL } from 'activitypub-core/src/globals';
import { Pokemon } from 'pokenode-ts';

export function PokemonSummary({ player, pokemon, species}: { species: Pokemon, player: AP.Actor, pokemon: AP.Application}) {
  return <>
    <textarea defaultValue={JSON.stringify(species.sprites)}></textarea>
    {species.sprites.front_default ? (
      <img src={species.sprites.front_default} />
    ) : null}
    {pokemon.preferredUsername}
    <p>Types</p>
    <ul>
      {species.types.map((type) => {
        return <>{type.type.name}</>
      })}
    </ul>
  </>
}