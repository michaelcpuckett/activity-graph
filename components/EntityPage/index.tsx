import * as AP from 'activitypub-core/src/types';
import { ActivityEntity } from './Activity';
import { ActorEntity } from './Actor';
import { CollectionEntity } from './Collection';
import { CollectionPageEntity } from './CollectionPage';
import { LinkEntity } from './Link';
import { ObjectEntity } from './Object';
import { OrderedCollectionEntity } from './OrderedCollection';
import { OrderedCollectionPageEntity } from './OrderedCollectionPage';
import { Header } from '../Header';
import Head from 'next/head';

export function EntityPage({
  entity,
}: {
  entity: AP.Thing;
}) {
  return (
    <>
      <Head>
        <title>ActivityWeb</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <>
          <Header />
          <Entity entity={entity}></Entity>
          <details>
            <summary>
              Raw
            </summary>
            <textarea defaultValue={JSON.stringify(entity)}></textarea>
          </details>
        </>
      </main>
    </>
  );
}

function Entity({ entity }: { entity: AP.Thing }) {
  if (entity.type === AP.CollectionTypes.COLLECTION) {
    return <CollectionEntity collection={entity as AP.Collection}></CollectionEntity>;
  }

  if (entity.type === AP.CollectionTypes.ORDERED_COLLECTION) {
    return <OrderedCollectionEntity collection={entity as AP.OrderedCollection}></OrderedCollectionEntity>;
  }

  if (entity.type === AP.CollectionPageTypes.COLLECTION_PAGE) {
    return <CollectionPageEntity collectionPage={entity as AP.CollectionPage}></CollectionPageEntity>;
  }

  if (entity.type === AP.CollectionPageTypes.ORDERED_COLLECTION_PAGE) {
    return <OrderedCollectionPageEntity orderedCollectionPage={entity as AP.OrderedCollectionPage}></OrderedCollectionPageEntity>;
  }

  for (const type of Object.values(AP.ActivityTypes)) {
    if (entity.type === type) {
      return <ActivityEntity activity={entity as AP.Activity}></ActivityEntity>;
    }
  }

  for (const type of Object.values(AP.ActorTypes)) {
    if (entity.type === type) {
      return <ActorEntity actor={entity as AP.Actor}></ActorEntity>
    }
  }

  for (const type of Object.values(AP.ObjectTypes)) {
    if (entity.type === type) {
      return <ObjectEntity object={entity as AP.Object}></ObjectEntity>
    }
  }

  for (const type of Object.values(AP.LinkTypes)) {
    if (entity.type === type) {
      return <LinkEntity link={entity as AP.Link}></LinkEntity>
    }
  }

  return <>
    TODO.
  </>;
}