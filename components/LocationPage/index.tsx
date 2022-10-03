import { ChangeEvent, ChangeEventHandler, FormEvent, FormEventHandler, MouseEventHandler, ReactElement, useState } from 'react';
import { AP } from 'activitypub-core/src/types';
import { ACCEPT_HEADER, ACTIVITYSTREAMS_CONTENT_TYPE, LOCAL_DOMAIN, LOCAL_HOSTNAME, PORT, PROTOCOL } from 'activitypub-core/src/globals';
import { OutboxFeed } from '../OutboxFeed';
import { PartyPokemon } from '../PartyPokemon';

export function LocationPage({ player, locations, pokemonCollection, visitedCollection }: { player: AP.Actor, locations: AP.Place[], pokemonCollection: AP.OrderedCollection, visitedCollection: AP.OrderedCollection }) {
  let currentLocation: AP.Place|undefined;

  if (Array.isArray(visitedCollection?.orderedItems)) {
    const lastLocation = visitedCollection?.orderedItems[0];

    if (lastLocation && !(lastLocation instanceof URL) && lastLocation.type === AP.ExtendedObjectTypes.PLACE) {
      currentLocation = lastLocation;
    }
  }

  const handleTravel: FormEventHandler<HTMLFormElement> = (event: FormEvent<HTMLFormElement>) => {
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

    if (!query.location) {
      return;
    }

    fetch(`${PROTOCOL}//${LOCAL_HOSTNAME}${PORT ? `:${PORT}` : ''}/api/travel`, {
      method: 'POST',
      body: JSON.stringify({
        actor: player.id.toString(),
        location: query.location,
      }),
    }).then(() => {
      window.location.reload();
    });

  }
  
  return <>
    <h1>
      Welcome to {currentLocation?.name}!
    </h1>
    <form noValidate onSubmit={handleTravel}>
      <select name="location">
        {locations?.map(location => {
          return <option key={location.id?.toString()} value={location.id?.toString() ?? ''}>
            {location.name}
          </option>;
        })}
      </select>
      
      <button type="submit">
        Go
      </button>
    </form>
    <details>
      <summary>
        Your Feed
      </summary>
      <OutboxFeed player={player} />
    </details>
    <details>
      <summary>
        Pokemon in your Party
      </summary>
      <PartyPokemon player={player} pokemonCollection={pokemonCollection} />
    </details>
  </>
}