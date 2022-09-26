import * as AP from 'activitypub-core/types';
import NextLink from 'next/link';
import { styles } from './styles';
import { ActivityEntity } from './Activity';
import { ActorEntity } from './Actor';
import { CollectionEntity } from './Collection';
import { CollectionPageEntity } from './CollectionPage';
import { LinkEntity } from './Link';
import { ObjectEntity } from './Object';
import { OrderedCollectionEntity } from './OrderedCollection';
import { OrderedCollectionPageEntity } from './OrderedCollectionPage';

export function EntityPage({
  entity,
}: {
  entity: AP.Thing;
}) {
  return (
    <html>
      <style>
        {styles}
      </style>
      <body>
        <main>
          <>
            <header>
              <NextLink href="/home">
                {'ActivityWeb'}
              </NextLink>
            </header>
            <Entity entity={entity}></Entity>
            <details>
              <summary>
                Raw
              </summary>
              <textarea>
                {JSON.stringify(entity)}
              </textarea>
            </details>
          </>
        </main>
      </body>
    </html>
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