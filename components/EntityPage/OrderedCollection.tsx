import * as AP from '../../lib/types/activity_pub';
import { ThingCard } from '../ThingCard';

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
        if (typeof orderedItem === 'string') {
          return <></>;
        }

        return (
          <ThingCard
            thing={orderedItem}
            key={orderedItem.id}
          ></ThingCard>
        );
      })}
    </ol>
  </>;
}