import { ChangeEvent, ChangeEventHandler, FormEvent, FormEventHandler, MouseEventHandler, ReactElement, useState } from 'react';
import { AP } from 'activitypub-core/src/types';
import { ACCEPT_HEADER, ACTIVITYSTREAMS_CONTENT_TYPE, LOCAL_DOMAIN, LOCAL_HOSTNAME, PORT, PROTOCOL } from 'activitypub-core/src/globals';

export function StartPage({ player, locations }: { player: AP.Actor, locations: AP.Place[] }) {
  const handleStart: FormEventHandler<HTMLFormElement> = (event: FormEvent<HTMLFormElement>) => {
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
              result.push([name, checkableElement.value]);
            }
          }
        }
      }
    }

    const query = Object.fromEntries(result);

    if (!player.id) {
      return;
    }

    if (!(query.starter && query.location)) {
      return;
    }

    console.log(query)

    fetch(`${PROTOCOL}//${LOCAL_HOSTNAME}${PORT ? `:${PORT}` : ''}/api/start`, {
      method: 'POST',
      body: JSON.stringify({
        actor: player.id.toString(),
        starterPokemon: query.starter,
        startingLocation: query.location,
      }),
    }).then(() => {
      window.location.reload();
    });
  };

return <>
    <h1>
      Welcome to the world of Pokemon, {player.preferredUsername}!
    </h1>
    <p>
      Now, where are you from?
    </p>
    <form
      onSubmit={handleStart}
      noValidate>
      <label>
        <span>
          Hometown
        </span>
        <select name="location">
          {locations?.map(location => {
            return <option key={location.id?.toString()} value={location.id?.toString() ?? ''}>
              {location.name}
            </option>;
          })}
        </select>
      </label>
      <p>
        Choose a partner to begin your quest.
      </p>
      <fieldset name="starter">
        <legend>Your First Pokemon</legend>
        {[
          'Togepi', // Fairy
          'Larvitar', // Dark
          'Tyrogue', // Fighting
          'Gible', // Dragon
          'Ralts', // Psychic
          'Riolu', // Steel
        ].map(name => (
          <label key={name}>
            <span>{name}</span>
            <input type="radio" name="starter" value={name} />
          </label>
        ))}
      </fieldset>
      <button type="submit">
        I Choose You!
      </button>
    </form>
  </>
}