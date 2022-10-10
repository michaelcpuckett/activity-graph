import { AP } from 'activitypub-core/src/types';
import { NoteCard } from '../EntityCard/Note';
import { EntityLink } from '../EntityLink';
import { EntityMeta } from '../EntityMeta';

export function ActivityEntity({ activity }: { activity: AP.Activity }) {
  const {
    actor,
    target
  } = activity;

  console.log({
    activity,
  })

  let object = null;

  if ('object' in activity) {
    object = activity.object;
  }

  if (!actor) {
    return <>Not found.</>;
  }

  return (
    <div>
      <h1>
        <EntityLink entity={activity}>
          {activity.type}
        </EntityLink>
      </h1>
      <dl>
        <EntityMeta entity={actor as AP.Entity}>
          Actor
        </EntityMeta>
        <EntityMeta entity={object as AP.Entity}>
          Object
        </EntityMeta>
        <EntityMeta entity={target as AP.Entity}>
          Target
        </EntityMeta>
      </dl>
      {object && !(object instanceof URL) && !Array.isArray(object) && object.type === AP.ExtendedObjectTypes.NOTE ? <NoteCard note={object} /> : null}
    </div>
  );
}
