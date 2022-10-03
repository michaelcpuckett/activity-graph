import { AP } from "activitypub-core/src/types";

export function ArriveOutboxActivity({ activity }: { activity: AP.Arrive }) {
  if (activity.actor instanceof URL || !('outbox' in activity.actor)) {
    return <></>;
  }

  if (!activity.location || activity.location instanceof URL || !('name' in activity.location)) {
    return <></>;
  }

  return <>
    <a href={activity.actor.id?.toString() ?? '#'}>
      @{activity.actor.preferredUsername}
    </a>
    
    {' '}
    <a href={activity.id?.toString() ?? '#'}>
      arrived
    </a>
    
    {' '}
    in
    {' '}
    <a href={activity.location.id?.toString() ?? '#'}>
      {activity.location.name}
    </a>.
  </>;
}