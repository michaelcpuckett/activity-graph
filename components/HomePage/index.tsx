import Head from 'next/head'
import { ChangeEvent, ChangeEventHandler, FormEvent, FormEventHandler, MouseEventHandler, ReactElement, useState } from 'react';
import { AP } from 'activitypub-core/src/types';
import { ACCEPT_HEADER, ACTIVITYSTREAMS_CONTENT_TYPE, LOCAL_DOMAIN, LOCAL_HOSTNAME, PORT, PROTOCOL } from 'activitypub-core/src/globals';
import { getGuid } from 'activitypub-core/src/crypto';
import {convertStringsToUrls} from 'activitypub-core/src/utilities/convertStringsToUrls';
import { StartPage } from './StartPage';
import { LocationPage } from './LocationPage';

type Data = {
  actor: AP.Actor;
  locations: AP.Place[];
  groups?: AP.Collection;
}

export function HomePage({
  actor,
  locations,
}: Data) {
  const player = convertStringsToUrls(actor) as AP.Actor;
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

  return (
    <>
      <Head>
        <title>ActivityWeb</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        {(pokemonCollection?.totalItems && visitedCollection) ?
          <LocationPage
            player={player}
            pokemonCollection={pokemonCollection}
            visitedCollection={visitedCollection}
            locations={locations}
          /> :
          <StartPage
            player={player}
            locations={locations}
          />}
      </main>
    </>
  )
}