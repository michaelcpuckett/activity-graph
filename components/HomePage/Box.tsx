import { ChangeEventHandler, ReactElement } from 'react';
import { AP } from 'activitypub-core/src/types';
import { EntityCard } from '../EntityCard';
import { FilterForm } from './FilterForm';

export function Box({ items, actor, filter, handleOutboxSubmit, handleFilterChange, children }: { items: AP.Entity[], actor: AP.Actor, filter: string, handleFilterChange: ChangeEventHandler<HTMLSelectElement>, handleOutboxSubmit: Function, children: string | ReactElement }) {
  return <>
    {children}
    <FilterForm filter={filter} handleFilterChange={handleFilterChange} />
    <ol>
      {items.map(item => <EntityCard
        actor={actor}
        handleOutboxSubmit={handleOutboxSubmit}
        filter={filter}
        thing={item}
        key={item.id?.toString()}
      />) ?? null}
    </ol>
  </>
}
