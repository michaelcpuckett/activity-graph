import { Graph } from ".";
import * as AP from '../types/activity_pub';
import { APActivity } from '../classes/activity_pub';

export async function broadcastActivity(this: Graph, activity: APActivity, actor: AP.Actor) {
  const recipients = await this.getRecipientInboxUrls(activity);

  console.log({ recipients });

  return await Promise.all(
    recipients.map(async (recipient) => {
      return await this.signAndSendToForeignActorInbox(
        recipient,
        actor,
        activity.formatPublicObject(),
      );
    }),
  );
}