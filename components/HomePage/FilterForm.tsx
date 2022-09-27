import * as AP from 'activitypub-core/src/types';
import { ChangeEventHandler } from 'react';

export function FilterForm({ filter, handleFilterChange }: { filter: string, handleFilterChange: ChangeEventHandler<HTMLSelectElement> }) {
  return (
    <form>
      <label>
        <span>
          Filter
        </span>
        <select onChange={handleFilterChange} defaultValue={filter}>
          <option>All Activity</option>
          <option value={AP.ActivityTypes.CREATE}>All Creations</option>
        </select>
      </label>
    </form>
  );
}