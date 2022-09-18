import * as AP from '../../types/activity_pub';
import { APThing } from './thing';

export class APLink extends APThing implements AP.Link {
  type: typeof AP.LinkTypes[keyof typeof AP.LinkTypes];
  height?: number;
  href?: string;
  hrefLang?: string;
  mediaType?: string;
  name?: AP.StringReference;
  nameMap?: AP.StringReferenceMap;
  preview?: AP.ObjectOrLinkReference;
  rel?: AP.StringReference;
  width?: number;

  constructor(link: AP.AnyLink) {
    super(link);

    if (Object.values(AP.LinkTypes).includes(link.type)) {
      this.type = link.type;
    } else {
      throw new Error('`type` must be defined and be one of the Link Types.');
    }
  }
}
