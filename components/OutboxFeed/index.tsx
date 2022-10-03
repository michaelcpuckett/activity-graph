import { AP } from "activitypub-core/src/types";
import { AddOutboxActivity } from "./Add";
import { ArriveOutboxActivity } from "./Arrive";

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

  return <>
    @{activity.actor.preferredUsername} {activity.type}d.
  </>;
}

export function OutboxFeed({player}: { player: AP.Actor}) {
  if (player.outbox instanceof URL || !Array.isArray(player.outbox.orderedItems)) {
    return <></>;
  }

  return (
    <ol>
      {player.outbox.orderedItems.map(entity => {
        if (Array.isArray(entity)) {
          return <></>;
        }

        if (entity instanceof URL || !('actor' in entity)) {
          return <></>;
        }

        const activity: AP.Activity = entity;

        return (
          <li key={activity.id?.toString()}>
            <OutboxActivity activity={activity} />
          </li>
        );
      })}
    </ol>
  );
}