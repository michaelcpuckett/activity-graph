import * as AP from '../../types/activity_pub';
import { APCoreObject } from './core_object';

export class APActivity extends APCoreObject implements AP.Activity {
  type: typeof AP.ActivityTypes[keyof typeof AP.ActivityTypes];
  actor: AP.ObjectOrLinkReference;
  object?: AP.ObjectOrLinkReference;
  target?: AP.ObjectOrLinkReference;
  result?: AP.ObjectOrLinkReference;
  origin?: AP.ObjectOrLinkReference;
  instrument?: AP.ObjectOrLinkReference;

  constructor(activity: AP.AnyActivity) {
    super(activity);

    if (Object.values(AP.ActivityTypes).includes(activity.type)) {
      this.type = activity.type;
    } else {
      throw new Error('`type` must be defined and be one of the Activity Types.');
    }

    if (activity.actor) {
      this.actor = activity.actor;
    } else {
      throw new Error('`actor` must be defined.');
    }
  }
};
