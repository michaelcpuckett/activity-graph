import { AP } from "activitypub-core/src/types";

export function AddOutboxActivity({ activity }: { activity: AP.Add }) {
  if (activity.actor instanceof URL || !('outbox' in activity.actor)) {
    return <></>;
  }

  if (!activity.target || activity.target instanceof URL || !('name' in activity.target)) {
    return <></>;
  }

  if (!activity.object || activity.target instanceof URL || !('preferredUsername' in activity.object)) {
    return <></>;
  }

  if (activity.target.name === 'Pokemon') {
    return <>
      <a href={activity.id?.toString() ?? '#'}>
        @{activity.actor.preferredUsername}
      </a>

      {' '}
      <a href={activity.id?.toString() ?? '#'}>caught</a>

      {' '}
      <a href={activity.object.id?.toString() ?? '#'}>
        {activity.object.preferredUsername}
      </a>.
    </>;
  }

  return <>
    @{activity.actor.preferredUsername} {activity.type.toLowerCase()}d {activity.object.name} to {activity.target.name}.
  </>
}