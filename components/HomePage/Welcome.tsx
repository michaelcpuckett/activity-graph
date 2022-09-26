import * as AP from '../../lib/types/activity_pub';
import { Nav } from '../Nav';

export function Welcome({ actor }: { actor: AP.Actor }) {
  return <>
    <h1>Welcome, @{actor.preferredUsername}</h1>
  </>
}
