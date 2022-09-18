import * as AP from '../../types/activity_pub';

export class APLink implements AP.Link {
  id?: string | null;
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

  constructor(object: AP.AnyLink) {
    if (Object.values(AP.LinkTypes).includes(object.type)) {
      this.type = object.type;
    } else {
      throw new Error('`type` must be defined and be one of the Object Types.');
    }

    Object.assign(this, object);
  }
}
