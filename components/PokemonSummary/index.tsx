import { ChangeEvent, ChangeEventHandler, FormEvent, FormEventHandler, MouseEventHandler, ReactElement, useState } from 'react';
import { AP } from 'activitypub-core/src/types';
import { ACCEPT_HEADER, ACTIVITYSTREAMS_CONTENT_TYPE, LOCAL_DOMAIN, LOCAL_HOSTNAME, PORT, PROTOCOL } from 'activitypub-core/src/globals';
import { Pokemon } from 'pokenode-ts';

export function PokemonSummary({ player, pokemon, species}: { species: Pokemon, player: AP.Actor, pokemon: AP.Application}) {
  const level = 5;
  const totalHP = Math.round((( 2 * (species.stats.find(stat => stat.stat.name === 'hp')?.base_stat ?? 0) + 100) * level) / 100) + 10;
  return <>
    <div>
      <div style={{display: 'flex'}}>
        {species.sprites.front_default ? (
          <img src={species.sprites.front_default} style={{flex: '0 0 auto'}} height="120" width="120" />
        ) : null}
        <div>
          <h3>
            {pokemon.preferredUsername}
          </h3>
          <ul>
            {species.types.map((type) => {
              return <li>{type.type.name}</li>
            })}
          </ul>
        </div>
      </div>
      <div>
        {totalHP} / {totalHP} HP
      </div>
    </div>
  </>
}