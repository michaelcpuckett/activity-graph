import { ReactElement } from 'react';
import * as AP from 'activitypub-core/src/types';

function BoxLink({ collection, children }: { collection?: string | AP.AnyCollection, children: string | ReactElement }) {
  if (!collection) {
    return <></>
  };

  return typeof collection === 'string' ? (
    <li>
      <a href={collection}>
        {children}
      </a>
    </li>
  ) : typeof collection.url === 'string' ? (
    <li>
      <a href={collection.url}>
        {children}
      </a>
    </li>
  ) : <></>;
}

export function Nav({ actor, streams }: { actor: AP.AnyActor, streams?: AP.AnyCollection[] }) {
  return (
    <nav>
      <ul>
        {typeof actor.url === 'string' ? (
          <li>
            <a href={actor.url}>
              You
            </a>
          </li>
        ) : null}
        <BoxLink collection={actor.inbox}>
          Inbox
        </BoxLink>
        <BoxLink collection={actor.outbox}>
          Outbox
        </BoxLink>
        <BoxLink collection={actor.following}>
          Following
        </BoxLink>
        <BoxLink collection={actor.followers}>
          Followers
        </BoxLink>
        <BoxLink collection={actor.liked}>
          Liked
        </BoxLink>
        {streams ? streams.map(stream => (typeof stream !== 'string' && 'id' in stream && stream.id && 'name' in stream && stream.name && !Array.isArray(stream.name)) ?
          <BoxLink collection={stream.id}>
            {stream.name}
          </BoxLink> : <></>) : <></>}
      </ul>
    </nav>
  );
};