import * as AP from 'activitypub-core/types';
import { ThingCard } from '../ThingCard';

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
        if (typeof item === 'string') {
          return <></>;
        }

        return (
          <ThingCard
            thing={item}
            key={item.id}
          ></ThingCard>
        );
      })}
    </ul>
  </>;
}