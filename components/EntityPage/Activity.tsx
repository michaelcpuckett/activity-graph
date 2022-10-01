import { AP } from 'activitypub-core/src/types';

export function ActivityEntity({ activity }: { activity: AP.Activity }) {
  const {
    actor,
    target
  } = activity;

  const object = 'object' in activity ? activity.object : null;

  if (!actor || typeof actor !== 'object' || !('id' in actor) || !actor.id) {
    return <>Not found.</>;
  }

  return <div className="card">
    <h1>
      {activity.type}
      {(target && typeof target === 'object' && 'name' in target) ? <> to {target.name}</> : ''}
    </h1>
    <blockquote>
      {object && typeof object === 'object' && 'type' in object ? <>
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
          <a href={actor.id.toString()}>
            @{'preferredUsername' in actor ? actor.preferredUsername : ''}
          </a>
        </dd>

        {(object && typeof object === 'object' && 'name' in object) ? <>
          <dt>
            Object
          </dt>
          <dd>
            <a href={object.id ? object.id.toString() : '#'}>
              {object?.name ?? object?.type}
            </a>
          </dd>
        </> : <></>}

        {(target && typeof target === 'object' && 'name' in target) ? <>
          <dt>
            Target
          </dt>
          <dd>
            <a href={target.id ? target.id.toString() : '#'}>
              {target?.name ?? target?.type}
            </a>
          </dd>
        </> : <></>}
      </>
    </dl>
  </div>;
}
