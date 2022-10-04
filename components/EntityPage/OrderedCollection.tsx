import { AP } from 'activitypub-core/src/types';
import { EntityCard } from '../EntityCard';
import { EntityLink } from '../EntityLink';

export function OrderedCollectionEntity({ collection }: { collection: AP.OrderedCollection }) {
  const {
    orderedItems: items
  } = collection;

  if (!Array.isArray(items)) {
    return <></>
  }

  return (
    <div>
      <h1>
        <EntityLink entity={collection}>
          {collection.name}
        </EntityLink>
      </h1>
      {items.map(item => (
        <EntityCard entity={item}></EntityCard>
      ))}
    </div>
  );
}