import Head from 'next/head'
import { ChangeEvent, ChangeEventHandler, FormEventHandler, MouseEventHandler, ReactElement, useState } from 'react';
import { AP } from 'activitypub-core/src/types';
import { Nav } from '../Nav';
import { Header } from '../Header';
import { Welcome } from './Welcome';
import { Box } from './Box';
import { CreateForm } from './CreateForm';
import { SearchForm } from './SearchForm';
import { ACCEPT_HEADER, ACTIVITYSTREAMS_CONTENT_TYPE } from 'activitypub-core/src/globals';
import { convertStringsToUrls } from 'activitypub-core/src/utilities/convertStringsToUrls';

type Data = {
  actor: AP.Actor;
}

export function HomePage({
  actor: rawActor,
}: Data) {
  const actor = convertStringsToUrls(rawActor) as AP.Actor;

  return (
    <>
      <Head>
        <title>ActivityWeb</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header />
        <Welcome actor={actor} />
        <Nav actor={actor} />
        <CreateForm actor={actor} />
      </main>
    </>
  )
}