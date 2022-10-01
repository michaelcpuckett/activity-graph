import { AP } from 'activitypub-core/src/types';
import { EntityCard } from '../EntityCard';

export function OrderedCollectionEntity({ collection }: { collection: AP.OrderedCollection }) {
  const {
    orderedItems
  } = collection;

  if (!Array.isArray(orderedItems)) {
    return <></>;
  }

  return <>
    <div className="intro">
      <h1>{collection.name ?? 'Collection'}</h1>
    </div>
    <ol reversed>
      {orderedItems.map(orderedItem => {
        if (orderedItem instanceof URL) {
          return <></>;
        }

        return (
          <EntityCard
            entity={orderedItem}
            key={orderedItem.id?.toString()}
          ></EntityCard>
        );
      })}
    </ol>
  </>;
}