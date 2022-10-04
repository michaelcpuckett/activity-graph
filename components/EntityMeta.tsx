import { AP } from 'activitypub-core/src/types';
import { ReactNode } from 'react';
import { EntityLink } from "./EntityLink";

export function EntityMeta({ entity, children }: { entity?: null|AP.Entity[]|AP.Entity, children: ReactNode }) {
  if (!entity || Array.isArray(entity) || entity instanceof URL) {
    return <></>;
  }

  return (
    <>
      <dt>
        {children}
      </dt>
      <dd>
        <EntityLink entity={entity}>
          {entity?.name ?? entity?.type}
        </EntityLink>
      </dd>
    </>
  );
}