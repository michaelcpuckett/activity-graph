import * as AP from '../../types/activity_pub';
import { getGuid } from "../../crypto";
import { LOCAL_DOMAIN } from '../../globals';

export class APThing implements AP.Thing {
  id: string | null;
  type: typeof AP.AllTypes[keyof typeof AP.AllTypes];

  getCollectionType() {
    return 'object';
  }

  constructor(thing: AP.AnyThing) {
    if (Object.values(AP.AllTypes).includes(thing.type)) {
      this.type = thing.type;
    } else {
      throw new Error('Bad type.')
    }

    if (thing.id) {
      this.id = thing.id;
    } else {
      const collectionType = this.getCollectionType();

      if (collectionType === 'actor' && 'preferredUsername' in thing) {
        this.id = `${LOCAL_DOMAIN}/${collectionType}/${thing.preferredUsername}`
      } else {
        const guid = getGuid();
        this.id = `${LOCAL_DOMAIN}/${this.getCollectionType()}/${guid}`;
      }
    }

    Object.assign(this, thing);
  }
}