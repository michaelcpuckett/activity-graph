import { ChangeEventHandler, ReactElement } from 'react';
import * as AP from 'activitypub-core/types';
import { ThingCard } from '../ThingCard';
import { FilterForm } from './FilterForm';

export function Box({ items, actor, filter, handleOutboxSubmit, handleFilterChange, children }: { items: AP.AnyThing[], actor: AP.Actor, filter: string, handleFilterChange: ChangeEventHandler<HTMLSelectElement>, handleOutboxSubmit: Function, children: string | ReactElement }) {
  return <>
    {children}
    <FilterForm filter={filter} handleFilterChange={handleFilterChange} />
    <ol>
      {items.map(item => <ThingCard
        actor={actor}
        handleOutboxSubmit={handleOutboxSubmit}
        filter={filter}
        thing={item}
        key={item.id}
      />) ?? null}
    </ol>
  </>
}
