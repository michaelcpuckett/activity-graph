import { AP } from 'activitypub-core/src/types';
import { ReactNode } from 'react';

export function EntityLink({ entity, children }: { entity?: void | null | URL | AP.Entity, children: ReactNode }) {
  if (!entity) {
    return <></>;
  }

  if (entity instanceof URL) {
    return <></>;
  }

  if (!entity.id) {
    return <></>;
  }

  return (
    <a href={entity.id.toString()}>
      {children}
    </a>
  );
}