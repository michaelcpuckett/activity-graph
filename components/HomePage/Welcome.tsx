import * as AP from 'activitypub-core/types';
import { Nav } from '../Nav';

export function Welcome({ actor }: { actor: AP.Actor }) {
  return <>
    <h1>Welcome, @{actor.preferredUsername}</h1>
  </>
}
