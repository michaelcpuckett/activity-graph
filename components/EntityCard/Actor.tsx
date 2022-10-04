import { AP } from 'activitypub-core/src/types';
import { EntityLink } from '../EntityLink';
import { EntityMeta } from '../EntityMeta';

export function ActorCard({ actor }: { actor: AP.Actor }) {
  const {
    preferredUsername,
    name,
    inbox,
    outbox,
  } = actor;

  return (
    <div>
      <h2>
        <EntityLink entity={actor}>
          @{preferredUsername ?? name}
        </EntityLink>
      </h2>
      <dl>
        <EntityMeta entity={inbox as AP.Entity}>
          Inbox
        </EntityMeta>
        <EntityMeta entity={outbox as AP.Entity}>
          Object
        </EntityMeta>
        <EntityMeta entity={actor.following as AP.Entity}>
          Following
        </EntityMeta>
        <EntityMeta entity={actor.followers as AP.Entity}>
          Followers
        </EntityMeta>
        {actor.streams?.map(stream => (
          <EntityMeta entity={stream as AP.Entity}>
            {stream?.name}
          </EntityMeta>
        ))}
      </dl>
    </div>
  );
}



