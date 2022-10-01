import { PUBLIC_ACTOR } from 'activitypub-core/src/globals';
import { AP } from 'activitypub-core/src/types';

export function EntityCard({ entity, streams, filter, actor, handleOutboxSubmit }: { entity: URL | AP.Entity, filter?: string; actor?: AP.Actor; handleOutboxSubmit?: Function; streams?: AP.EitherCollection[]; }) {
  if (entity instanceof URL) {
    return <>Not found.</>;
  }

  return <li className="card" key={entity.id?.toString() ?? ''}>
    <a href={entity.id?.toString() ?? ''}>
      {entity.id?.toString() ?? ''}
    </a>
  </li>;
}