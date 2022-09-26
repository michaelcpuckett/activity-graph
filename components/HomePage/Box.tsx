import { ChangeEventHandler, ReactElement } from 'react';
import * as AP from 'activitypub-core/types';
import { ThingCard } from '../ThingCard';
import { FilterForm } from './FilterForm';

export function Box({ items, filter, handleFilterChange, children }: { items: AP.AnyThing[], filter: string, handleFilterChange: ChangeEventHandler<HTMLSelectElement>, children: string | ReactElement }) {
  return <>
    {children}
    <FilterForm filter={filter} handleFilterChange={handleFilterChange} />
    <ol>
      {items.map(item => <ThingCard
        filter={filter}
        thing={item}
        key={item.id}
      />) ?? null}
    </ol>
  </>
}
