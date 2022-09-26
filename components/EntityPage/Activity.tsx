import * as AP from 'activitypub-core/types';

export function ActivityEntity({ activity }: { activity: AP.Activity }) {
  const {
    actor,
    object,
    target
  } = activity;

  if (!actor || typeof actor !== 'object' || !('id' in actor) || !actor.id) {
    return <>Not found.</>;
  }

  return <div className="card">
    <h1>
      {activity.type}
      {(target && typeof target === 'object' && 'name' in target) ? <> to {target.name}</> : ''}
    </h1>
    <blockquote>
      {typeof object === 'object' && 'type' in object ? <>
        {object.type === AP.ActorTypes.PERSON ||
          object.type === AP.ActorTypes.APPLICATION ||
          object.type === AP.ActorTypes.GROUP ||
          object.type === AP.ActorTypes.ORGANIZATION ||
          object.type === AP.ActorTypes.SERVICE ? <>@</> : <></>}
        {object && 'summary' in object ? object.summary : object?.name ?? object?.type}
      </> : <></>}
    </blockquote>
    <dl>
      <>
        <dt>
          Created
        </dt>
        <dd>
          {activity.published ? new Date(activity.published).toDateString() : ''}
        </dd>

        <dt>
          Performed by
        </dt>
        <dd>
          <a href={actor.id}>
            @{'preferredUsername' in actor ? actor.preferredUsername : ''}
          </a>
        </dd>

        {(object && typeof object === 'object' && 'name' in object) ? <>
          <dt>
            Object
          </dt>
          <dd>
            <a href={object.id ?? '#'}>
              {object?.name ?? object?.type}
            </a>
          </dd>
        </> : <></>}

        {(target && typeof target === 'object' && 'name' in target) ? <>
          <dt>
            Target
          </dt>
          <dd>
            <a href={target.id ?? '#'}>
              {target?.name ?? target?.type}
            </a>
          </dd>
        </> : <></>}
      </>
    </dl>
  </div>;
}
