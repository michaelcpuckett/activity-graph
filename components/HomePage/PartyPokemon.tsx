import { ChangeEvent, ChangeEventHandler, FormEvent, FormEventHandler, MouseEventHandler, ReactElement, useState } from 'react';
import { AP } from 'activitypub-core/src/types';
import { ACCEPT_HEADER, ACTIVITYSTREAMS_CONTENT_TYPE, LOCAL_DOMAIN, LOCAL_HOSTNAME, PORT, PROTOCOL } from 'activitypub-core/src/globals';

export function PartyPokemon({ player, pokemonCollection}: { player: AP.Actor, pokemonCollection: AP.OrderedCollection}) {
  const handleWildPokemonInteraction: FormEventHandler<HTMLFormElement> = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const formElement = event.currentTarget;
    const result: Array<[string, unknown]> = [];

    for (const element of [...formElement.elements]) {
      const name = element.getAttribute('name');

      if (name) {
        result.push([name, element.getAttribute('value')]);
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

    fetch(`${PROTOCOL}//${LOCAL_HOSTNAME}${PORT ? `:${PORT}` : ''}/api/pokemon`, {
      method: 'POST',
      body: JSON.stringify({
        actor: player.id.toString(),
        name: query.name,
      }),
    }).then(() => {
      window.location.reload();
    });

  };

return <>
      <h2>Your Pokemon</h2>
      <ol>
        {(pokemonCollection && Array.isArray(pokemonCollection?.orderedItems)) ? pokemonCollection.orderedItems.map((pokemon) => {
          if (typeof pokemon === 'object' && !(pokemon instanceof URL) && pokemon.type === AP.ActorTypes.APPLICATION) {
            return <li key={pokemon.id?.toString()}>
              {pokemon.preferredUsername}
            </li>
          }
        }) : <></>}
      </ol>
    </>
}