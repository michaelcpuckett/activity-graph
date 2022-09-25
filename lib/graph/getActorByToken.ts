import { Graph } from ".";
import * as AP from '../types/activity_pub';

export async function getActorByToken(this: Graph, token: string): Promise<AP.AnyActor | null> {
  const userId = await this.getAuthenticatedUserIdByToken(token);

  if (!userId) {
    return null;
  }

  const preferredUsername = await this.findStringValueById(
    'username',
    userId,
  );
  const user = await this.findOne('actor', { preferredUsername });

  if (user && 'preferredUsername' in user) {
    return user;
  }

  return null;
}