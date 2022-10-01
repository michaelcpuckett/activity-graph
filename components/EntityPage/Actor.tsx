import { AP } from 'activitypub-core/src/types';

export function ActorEntity({ actor }: { actor: AP.Actor }) {
  return <div className="card">
    <h1>@{actor.preferredUsername}</h1>
    <blockquote>
      {actor.summary ?? '<No bio yet.>'}
    </blockquote>
    <dl>
      <>
        <dt>
          Created
        </dt>
        <dd>
          {actor.published ? new Date(actor.published).toDateString() : ''}
        </dd>
      </>
    </dl>
    <ul>
      {[actor.inbox instanceof URL ? actor.inbox : actor.inbox.id?.toString()].map(id => <>
        <li>
          <a href={id?.toString() ?? '#'}>
            Inbox
          </a>
        </li>
      </>)}
      {[actor.outbox instanceof URL ? actor.outbox : actor.outbox.id?.toString()].map(id => <>
        <li>
          <a href={id?.toString() ?? '#'}>
            Outbox
          </a>
        </li>
      </>)}

      {[actor.following ? (actor.following instanceof URL ? actor.following : actor.following.id) : ''].map(id => <>
        <li>
          <a href={id?.toString() ?? '#'}>
            Following
          </a>
        </li>
      </>)}

      {[actor.followers ? (actor.followers instanceof URL ? actor.followers : actor.followers.id) : ''].map(id => <>
        <li>
          <a href={id?.toString() ?? '#'}>
            Followers
          </a>
        </li>
      </>)}

      {[actor.liked instanceof URL ? actor.liked : actor.liked?.id ?? null].map(id => <>
        <li>
          <a href={id?.toString() ?? '#'}>
            Liked
          </a>
        </li>
      </>)}

      {Array.isArray(actor.streams) ? actor.streams.map(stream => <>
        {stream instanceof URL ? <><li><a href={stream.toString()}>{stream.toString()}</a></li></> : <>
          <li>
            <a href={stream.id?.toString() ?? '#'}>
              {stream.name ?? stream.id?.toString() ?? ''}
            </a>
          </li>
        </>}
      </>) : <></>}
    </ul>
  </div>;
}