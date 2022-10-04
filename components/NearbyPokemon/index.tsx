import { ChangeEvent, ChangeEventHandler, FormEvent, FormEventHandler, MouseEventHandler, ReactElement, useState } from 'react';
import { AP } from 'activitypub-core/src/types';
import { ACCEPT_HEADER, ACTIVITYSTREAMS_CONTENT_TYPE, LOCAL_DOMAIN, LOCAL_HOSTNAME, PORT, PROTOCOL } from 'activitypub-core/src/globals';
import { PokemonSummary } from '../PokemonSummary';
import { Pokemon } from 'pokenode-ts';

export function NearbyPokemon({ location, player, pokemonCollection, speciesData}: { location: AP.Place & { [key: string]: unknown }, speciesData: AP.Document[], player: AP.Actor, pokemonCollection: AP.OrderedCollection}) {
  const handleCatch: FormEventHandler<HTMLFormElement> = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formElement = event.currentTarget;
    const result: Array<[string, unknown]> = [];

    for (const element of [...formElement.elements]) {
      const name = element.getAttribute('name');

      if (name && (element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement)) {
        result.push([name, element.value]);
      }
    }

    for (const element of [...formElement.elements]) {
      if (element instanceof HTMLFieldSetElement) {
        const name = element.getAttribute('name');

        if (name) {
          for (const checkableElement of [...element.elements]) {
            if (checkableElement instanceof HTMLInputElement && checkableElement.checked) {
              result.push([name, checkableElement.checked]);
            }
          }
        }
      }
    }

    const query = Object.fromEntries(result);

    if (!player.id) {
      return;
    }

    console.log(query);

    fetch(`${PROTOCOL}//${LOCAL_HOSTNAME}${PORT ? `:${PORT}` : ''}/api/pokemon`, {
      method: 'POST',
      body: JSON.stringify({
        actor: player.id.toString(),
        name: query.nearbyPokemon,
      }),
    }).then(() => {
      window.location.reload();
    });

  }

  let nearbyPokemonOptions = [];

  console.log(location)

  if (location && 'poke:nearbyPokemon' in location && Array.isArray(location['poke:nearbyPokemon'])) {
    nearbyPokemonOptions = location['poke:nearbyPokemon'];
  }

  console.log(nearbyPokemonOptions)
  
  return <form noValidate onSubmit={handleCatch}>
    <p>Nearby Pokemon</p>
    {(Array.isArray(nearbyPokemonOptions)) ? nearbyPokemonOptions.map((pokemon) => {
      const species = speciesData[pokemon.toLowerCase()] as unknown as Pokemon;
      return species ? (
        <li key={species.name}>
          <label>
            {species.sprites.front_default ? (
            <img src={species.sprites.front_default} style={{flex: '0 0 auto'}} height="120" width="120" />
          ) : null}
            {species.name}
            <input type="radio" name="nearbyPokemon" value={species.name} />
          </label>
        </li>
    ) : <></>}) : <></>}
    <button type="submit">
      Catch it!
    </button>
  </form>
}