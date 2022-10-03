import { AP } from "activitypub-core/src/types";

function ArriveOutboxActivity({ activity }: { activity: AP.Arrive }) {
  if (activity.actor instanceof URL || !('outbox' in activity.actor)) {
    return <></>;
  }

  if (!activity.location || activity.location instanceof URL || !('name' in activity.location)) {
    return <></>;
  }

  return  <>@{activity.actor.preferredUsername} {activity.type.toLowerCase()}d in {activity.location.name}.</>
}
function AddOutboxActivity({ activity }: { activity: AP.Add }) {
  if (activity.actor instanceof URL || !('outbox' in activity.actor)) {
    return <></>;
  }

  console.log(activity.target, activity)

  if (!activity.target || activity.target instanceof URL || !('name' in activity.target)) {
    return <></>;
  }
  if (!activity.object || activity.target instanceof URL || !('preferredUsername' in activity.object)) {
    return <></>;
  }

  if (activity.target.name === 'Pokemon') {
    return <>
      @{activity.actor.preferredUsername} caught {activity.object.preferredUsername}.
    </>
  }

  return  <>@{activity.actor.preferredUsername} {activity.type.toLowerCase()}d {activity.object.name} to {activity.target.name}.</>
}

function OutboxActivity({ activity }: { activity: AP.Activity }) {
  if (activity.actor instanceof URL || !('outbox' in activity.actor)) {
    return <></>;
  }
  if (activity.type === AP.ActivityTypes.ARRIVE) {
    return <ArriveOutboxActivity activity={activity} />
  }
  if (activity.type === AP.ActivityTypes.ADD) {
    return <AddOutboxActivity activity={activity} />
  }
  return  <>@{activity.actor.preferredUsername} {activity.type}d.</>
}

export function OutboxFeed({player}: { player: AP.Actor}) {
  if (player.outbox instanceof URL || !Array.isArray(player.outbox.orderedItems)) {
    return <></>;
  }
  return <ol>
    {player.outbox.orderedItems.map(entity => {
      if (Array.isArray(entity)) {
        return <></>;
      }
      if (entity instanceof URL || !('actor' in entity)) {
        return <></>;
      }
      const activity: AP.Activity = entity;
      return <li key={activity.id?.toString()}>
        <OutboxActivity activity={activity} />
      </li>
    })}
  </ol>;
}