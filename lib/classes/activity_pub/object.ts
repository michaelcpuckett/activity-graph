import * as AP from '../../types/activity_pub';
import { APCoreObject } from './core_object';

export class APObject extends APCoreObject implements AP.Object {
  type: typeof AP.ObjectTypes[keyof typeof AP.ObjectTypes];

  deleted?: Date;
  formerType?:
    | typeof AP.AllTypes[keyof typeof AP.AllTypes]
    | Array<typeof AP.AllTypes[keyof typeof AP.AllTypes]>;

  subject?: string | AP.CoreObject | AP.Link;
  object?: AP.ObjectOrLinkReference;
  relationship?: AP.ObjectReference;

  accuracy?: number;
  altitude?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
  units?: string;

  describes?: string | AP.CoreObject;

  constructor(object: AP.AnyObject) {
    super(object);

    if (Object.values(AP.ObjectTypes).includes(object.type)) {
      this.type = object.type;
    } else {
      throw new Error('`type` must be defined and be one of the Object Types.');
    }

    if ('describes' in object) {
      if (object.type !== AP.ObjectTypes.PROFILE) {
        throw new Error(
          'Some properties can only be used with `Profile` type.',
        );
      }
    }

    if ('deleted' in object || 'formerType' in object) {
      if (object.type !== AP.ObjectTypes.TOMBSTONE) {
        throw new Error(
          `Some properties can only be used with "Tombstone" type.`,
        );
      }
    }

    if ('subject' in object || 'object' in object || 'relationship' in object) {
      if (object.type !== AP.ObjectTypes.RELATIONSHIP) {
        throw new Error(
          `Some properties can only be used with "Relationship" type.`,
        );
      }
    }

    if (
      'accuracy' in object ||
      'altitude' in object ||
      'latitude' in object ||
      'longitude' in object ||
      'radius' in object ||
      'units' in object
    ) {
      if (object.type !== AP.ObjectTypes.PLACE) {
        throw new Error(`Some properties can only be used with "Place" type.`);
      }
    }
  }
}
