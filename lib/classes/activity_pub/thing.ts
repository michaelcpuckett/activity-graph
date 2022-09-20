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

    this.createChildren();
  }

  createChildren() {
    const props: Array<[string, APAnyThing|APAnyThing[]]> = [];

    for (const key of Object.keys(this)) {
      const value = this[key as keyof AP.Thing];

      if (value && typeof value === 'object' && 'type' in value) {
        const thing = getTypedThing(value);

        if (thing) {
          props.push([key, thing]);
        }
      } else if (Array.isArray(value) && 'length' in value) {
        const thingArray: APAnyThing[] = [];
        
        value.forEach(item => {
          if (item && typeof item === 'object' && 'type' in item) {
            return getTypedThing(item);
          }
        });
        
        if (thingArray.length === value.length) {
          props.push([key, thingArray]);
        }
      }
    }

    Object.assign(this, Object.fromEntries(props));
  }

  getCompressedProps() {
    return this.recursiveGetCompressedProps(JSON.parse(JSON.stringify(this)));
  }

  private recursiveGetCompressedProps(thing: AP.AnyThing) {
    const compressedProps: Array<AP.AnyThing> = [];
    
    for (const key of Object.keys(thing)) {
      const value = thing[key as keyof AP.AnyThing];

      if (value && typeof value === 'object' && 'type' in value) {
        const thing = new APThing(value);
        compressedProps.push(thing.compress());
        thing.getCompressedProps().map(compressedProp => {
          compressedProps.push(compressedProp);
        });
      } else if (Array.isArray(value) && 'length' in value) {
        value.forEach(item => {
          if (item && typeof item === 'object' && 'type' in item) {
            const thing = new APThing(item);
            compressedProps.push(thing.compress());
            thing.getCompressedProps().map(compressedProp => {
              compressedProps.push(compressedProp);
            });
          }
        });
      }
    }

    return compressedProps;
  }

  public compress(): AP.AnyThing {
    const compressedThing = [];

    for (const prop in this) {
      const value = this[prop];

      if (value && typeof value === 'object' && 'type' in value) {
        compressedThing.push([prop, this.getUrlForm(value)]);
      } else if (Array.isArray(value) && 'length' in value && value.length) {
        compressedThing.push([prop, value.map(item => {
          if (item && typeof item === 'object' && 'type' in item) {
            return this.getUrlForm(item);
          }
          return item;
        })]);
      } else {
        compressedThing.push([prop, value]);
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