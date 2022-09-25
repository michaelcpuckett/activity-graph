import { Graph } from ".";
import * as AP from '../types/activity_pub';

export async function getRecipientInboxUrls(this: Graph, activity: AP.Activity): Promise<string[]> {
  const recipients: string[] = [
    ...(activity.to ? await this.getRecipientsList(activity.to) : []),
    ...(activity.cc ? await this.getRecipientsList(activity.cc) : []),
    ...(activity.bto ? await this.getRecipientsList(activity.bto) : []),
    ...(activity.bcc ? await this.getRecipientsList(activity.bcc) : []),
  ];

  // get inbox for each recipient
  const recipientInboxes = await Promise.all(
    recipients.map(async (recipient) => {
      const foundThing = await this.queryById(recipient);

      if (!foundThing) {
        return null;
      }

      if (
        typeof foundThing === 'object' &&
        'inbox' in foundThing &&
        foundThing.inbox
      ) {
        return foundThing.inbox;
      }
    }),
  );

  const recipientInboxUrls: string[] = [];

  for (const recipientInbox of recipientInboxes) {
    if (typeof recipientInbox === 'string' && recipientInbox) {
      recipientInboxUrls.push(recipientInbox);
    }
  }

  return [...new Set(recipientInboxUrls)];
}
