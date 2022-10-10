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
import { OrderedCollectionEntity } from '../EntityPage/OrderedCollection';
import { CollectionEntity } from '../EntityPage/Collection';

type Data = {
  actor: AP.Actor;
}

export function HomePage({
  actor: rawActor
}: Data) {
  const actor = convertStringsToUrls(rawActor as unknown as { [key: string]: unknown });

  return (
    <>
      <Head>
        <title>ActivityWeb</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header />
        <div className="two-up">
          <div className="card">
            <Welcome actor={actor} />
            <Nav actor={actor} />
          </div>
          <div className="card">
            <CreateForm actor={actor} />
          </div>
        </div>
        <div className="two-up">
          <div className="card">
            <OrderedCollectionEntity collection={actor.inbox as AP.OrderedCollection} />
          </div>
          <div className="card">
            <OrderedCollectionEntity collection={actor.outbox as AP.OrderedCollection} />
          </div>
        </div>
        <div className="two-up">
          <div className="card">
            <CollectionEntity collection={actor.following as AP.Collection} />
          </div>
          <div className="card">
            <CollectionEntity collection={actor.followers as AP.Collection} />
          </div>
          <div className="card">
            <SearchForm actor={actor} />
          </div>
        </div>
        <textarea defaultValue={JSON.stringify(actor)}></textarea>
      </main>
    </>
  )
}