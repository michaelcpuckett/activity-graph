import * as AP from 'activitypub-core/types';

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
      {[typeof actor.inbox === 'string' ? actor.inbox : actor.inbox.id].map(id => <>
        <li>
          <a href={id ?? '#'}>
            Inbox
          </a>
        </li>
      </>)}
      {[typeof actor.outbox === 'string' ? actor.outbox : actor.outbox.id].map(id => <>
        <li>
          <a href={id ?? '#'}>
            Outbox
          </a>
        </li>
      </>)}

      {[actor.following ? (typeof actor.following === 'string' ? actor.following : actor.following.id) : ''].map(id => <>
        <li>
          <a href={id ?? '#'}>
            Following
          </a>
        </li>
      </>)}

      {[actor.followers ? (typeof actor.followers === 'string' ? actor.followers : actor.followers.id) : ''].map(id => <>
        <li>
          <a href={id ?? '#'}>
            Followers
          </a>
        </li>
      </>)}

      {[typeof actor.liked === 'string' ? actor.liked : actor.liked?.id ?? ''].map(id => <>
        <li>
          <a href={id ?? '#'}>
            Liked
          </a>
        </li>
      </>)}

      {Array.isArray(actor.streams) ? actor.streams.map(stream => <>
        {typeof stream === 'string' ? <><li><a href={stream}>{stream}</a></li></> : <>
          <li>
            <a href={stream.id ?? '#'}>
              {stream.name ?? stream.id ?? ''}
            </a>
          </li>
        </>}
      </>) : <></>}
    </ul>
  </div>;
}