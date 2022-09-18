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

  public compress() {
    const compressedThing = [];

    for (const prop in this) {
      const value = this[prop];

      if (typeof value === 'string') {
        compressedThing.push([prop, value]);
      } else if (value && typeof value === 'object' && 'type' in value) {
        compressedThing.push([prop, this.getUrlForm(value)]);
      }
    }

    return Object.fromEntries(compressedThing);
  }

  private getUrlForm(prop: AP.AnyThing) {
    if (typeof prop === 'string') {
      return prop;
    } else if (typeof prop === 'object') {
      if ('url' in prop) {
        if (typeof prop.url === 'string') {
          return prop.url;
        } else if (typeof prop.url === 'object') {
          if ('href' in prop.url) {
            if (typeof prop.url.href === 'string') {
              return prop.url.href;
            }
          }
        }
      } else if ('href' in prop) {
        if (typeof prop.href === 'string') {
          return prop.href;
        }
      }
      return '';
    }

  }

}