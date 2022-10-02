import Head from 'next/head'
import { ChangeEvent, ChangeEventHandler, FormEvent, FormEventHandler, MouseEventHandler, ReactElement, useState } from 'react';
import { AP } from 'activitypub-core/src/types';
import { Nav } from '../Nav';
import { Header } from '../Header';
import { Welcome } from './Welcome';
import { Box } from './Box';
import { CreateForm } from './CreateForm';
import { SearchForm } from './SearchForm';
import { ACCEPT_HEADER, ACTIVITYSTREAMS_CONTENT_TYPE, LOCAL_DOMAIN, LOCAL_HOSTNAME, PORT, PROTOCOL } from 'activitypub-core/src/globals';
import { getGuid } from 'activitypub-core/src/crypto';
import {convertStringsToUrls} from 'activitypub-core/src/utilities/convertStringsToUrls';

type Data = {
  actor: AP.Actor;
  inboxItems: AP.Entity[];
  outboxItems: AP.Entity[];
  streams?: AP.Collection[];
  following?: AP.Actor[];
  followers?: AP.Actor[];
  groups?: AP.Collection;
}

export function HomePage({
  actor,
  inboxItems,
  outboxItems,
  streams = [],
  following = [],
  followers = [],
}: Data) {
  const player = convertStringsToUrls(actor) as AP.Actor;
  console.log(player)
  const handleChooseStarter: FormEventHandler<HTMLFormElement> = (event: FormEvent<HTMLFormElement>) => {
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

    if (!query.starter) {
      return;
    }

    if (!player.id) {
      return;
    }

    fetch(`${PROTOCOL}//${LOCAL_HOSTNAME}${PORT ? `:${PORT}` : ''}/api/pokemon`, {
      method: 'POST',
      body: JSON.stringify({
        actor: player.id.toString(),
        name: query.starter,
      }),
    }).then(() => {
      window.location.reload();
    });
  };


  let pokemonCollection: AP.EitherCollection|null = null;

  for (const stream of player.streams || []) {
    if (stream.name === 'Pokemon') {
      pokemonCollection = stream;
      break;
    }
  }

  const noPokemonState = <>
    <h1>
      Welcome to the world of Pokemon, {player.preferredUsername}!
    </h1>
    <p>
      Choose a partner to begin your quest.
    </p>
    <form
      onSubmit={handleChooseStarter}
      noValidate>
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
    <p>You have a Pokemon!</p>
    <textarea defaultValue={JSON.stringify(pokemonCollection.items)}></textarea>
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