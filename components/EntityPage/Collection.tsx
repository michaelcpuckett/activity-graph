import { AP } from 'activitypub-core/src/types';
import { EntityCard } from '../EntityCard';

export function CollectionEntity({ collection }: { collection: AP.Collection }) {
  const {
    items
  } = collection;

  if (!Array.isArray(items)) {
    return <></>
  }

  return <>
    <div className="intro">
      <h1>{collection.name ?? 'Collection'}</h1>
    </div>
    <ul>
      {items.map(item => {
        if (item instanceof URL) {
          return <></>;
        }

        return (
          <EntityCard
            entity={item}
            key={item.id?.toString()}
          ></EntityCard>
        );
      })}
    </ul>
  </>;
}