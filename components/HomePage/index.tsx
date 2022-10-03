import Head from 'next/head'
import { ChangeEvent, ChangeEventHandler, FormEvent, FormEventHandler, MouseEventHandler, ReactElement, useState } from 'react';
import { AP } from 'activitypub-core/src/types';
import { ACCEPT_HEADER, ACTIVITYSTREAMS_CONTENT_TYPE, LOCAL_DOMAIN, LOCAL_HOSTNAME, PORT, PROTOCOL } from 'activitypub-core/src/globals';
import { getGuid } from 'activitypub-core/src/crypto';
import {convertStringsToUrls} from 'activitypub-core/src/utilities/convertStringsToUrls';

type Data = {
  actor: AP.Actor;
  locations?: AP.Place[];
  groups?: AP.Collection;
}

export function HomePage({
  actor,
  locations,
}: Data) {
  const player = convertStringsToUrls(actor) as AP.Actor;
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

    if (!(query.starter && query.location)) {
      console.log(query);
      return;
    }

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


  let pokemonCollection: AP.OrderedCollection|null = null;
  let visitedCollection: AP.OrderedCollection|null = null;

  for (const stream of player.streams || []) {
    if (stream instanceof URL) {
      continue;
    }
    if (stream.name === 'Pokemon') {
      pokemonCollection = stream as AP.OrderedCollection;
    }
    if (stream.name === 'Visited') {
      visitedCollection = stream as AP.OrderedCollection;
    }
  }

  let currentLocation: AP.Place|undefined;
  console.log(visitedCollection)
  if (Array.isArray(visitedCollection?.orderedItems)) {
    const lastLocation = visitedCollection?.orderedItems[visitedCollection.orderedItems.length - 1];

    if (lastLocation && !(lastLocation instanceof URL) && lastLocation.type === AP.ExtendedObjectTypes.PLACE) {
      currentLocation = lastLocation;
    }
  }

  const noPokemonState = <>
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
      <fieldset>
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
  </>;
  const withPokemonState = <>
    <h1>
      Welcome to {currentLocation?.name ?? '<working>'}!
    </h1>
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
    <div>
      <p>A wild Pikachu appeared!</p>
      <fieldset name="action">
        <legend>Actions</legend>
        <form noValidate onSubmit={handleWildPokemonInteraction}>
          <input type="hidden" name="name" value="pikachu" />
          <input type="hidden" name="action" value="fight" />
          <button type="submit">
            Fight
          </button>
        </form>
        <form noValidate onSubmit={handleWildPokemonInteraction}>
          <input type="hidden" name="name" value="pikachu" />
          <input type="hidden" name="action" value="pokemon" />
          <button type="submit">
            Pokemon
          </button>
        </form>
        <form noValidate onSubmit={handleWildPokemonInteraction}>
          <input type="hidden" name="name" value="pikachu" />
          <input type="hidden" name="action" value="items" />
          <button type="submit">
            Items (Throw PokeBall)
          </button>
        </form>
        <form noValidate onSubmit={handleWildPokemonInteraction}>
          <input type="hidden" name="name" value="pikachu" />
          <input type="hidden" name="action" value="run" />
          <button type="submit">
            Run
          </button>
        </form>
      </fieldset>
    </div>
  </>

  return (
    <>
      <Head>
        <title>ActivityWeb</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <>
          {pokemonCollection?.totalItems ? withPokemonState : noPokemonState}
        </>
      </main>
    </>
  )
}