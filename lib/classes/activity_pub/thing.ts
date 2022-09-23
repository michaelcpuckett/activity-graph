import * as AP from '../../types/activity_pub';
import { getGuid } from "../../crypto";
import { ACTIVITYSTREAMS_CONTEXT, CONTEXT, LOCAL_DOMAIN } from '../../globals';
import { getTypedThing } from '../../utilities/getTypedThing';
import { APAnyThing } from '.';

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

  public compress(): AP.AnyThing {
    const compressed = [];

    for (const [key, value] of Object.entries(this)) {
      if (typeof value === 'string' || key === 'id' || key === 'type') {
        compressed.push([key, value]);
      } else if (Array.isArray(value)) {
        const array = [...value];
        if (array.every((item: unknown) => typeof item === 'string')) {
          compressed.push([key, array]);
        } else {
          compressed.push([key, array.map(item => {
            if (typeof item === 'string') {
              return item;
            } else if (Array.isArray(item)) {
              return item;
            } else if ('id' in item && item.id) {
              return item.id;
            } else {
              return item;
            }
          })]);
        }
      } else if (value && typeof value === 'object' && 'id' in value && value.id) {
        compressed.push([key, value.id]);
      } else {
        compressed.push([key, value]);
      }
    }

    return Object.fromEntries(compressed);
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

      return prop.id;
    }
  }

  public formatPublicObject(): AP.AnyThing & {
    [CONTEXT]: string|string[];
  } {
    return {
      [CONTEXT]: ACTIVITYSTREAMS_CONTEXT,
      ...this.compress(),
    };
  }
}