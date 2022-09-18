import * as AP from '../../types/activity_pub';
import { getGuid } from "../../crypto";

export class APThing implements AP.Thing {
  id?: string | null;

  constructor(thing: AP.AnyThing) {
    if (!thing.id) {
      this.id = getGuid();
    }

    Object.assign(this, thing);
  }
}