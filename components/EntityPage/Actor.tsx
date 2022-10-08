import { AP } from 'activitypub-core/src/types';
import { EntityLink } from '../EntityLink';
import { EntityMeta } from '../EntityMeta';

export function ActorEntity({ actor }: { actor: AP.Actor }) {
  return (
    <div>
      <h2>
        <EntityLink entity={actor}>
          @{actor.preferredUsername ?? actor.name}
        </EntityLink>
      </h2>
      <dl>
        <EntityMeta entity={actor.inbox as AP.Entity}>
          Inbox
        </EntityMeta>
        <EntityMeta entity={actor.outbox as AP.Entity}>
          Outbox
        </EntityMeta>
        <EntityMeta entity={actor.following as AP.Entity}>
          Following
        </EntityMeta>
        <EntityMeta entity={actor.followers as AP.Entity}>
          Followers
        </EntityMeta>
        {actor.streams?.map(stream => (
          <EntityMeta
            key={!(stream instanceof URL) ? stream.id?.toString() : null}
            entity={stream as AP.Entity}>
            {!(stream instanceof URL) ? stream.name : ''}
          </EntityMeta>
        ))}
      </dl>
    </div>
  );
}