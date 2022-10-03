import { getGuid } from "activitypub-core/src/crypto";
import { LOCAL_HOSTNAME, PORT, PROTOCOL } from "activitypub-core/src/globals";
import { AP } from "activitypub-core/src/types";

const locations = [
  'Pallet Town',
  'Lavendar Town',
  'Cerulean City',
  'Ecruteak City',
  'Violet City',
]

export const allLocations: AP.Place[] = locations.map(location => {
  const id = `${PROTOCOL}//${LOCAL_HOSTNAME}${PORT ? `:${PORT}` : ''}/object/${getGuid()}`;
  return {
    id: new URL(id),
    url: new URL(id),
    type: AP.ExtendedObjectTypes.PLACE,
    name: location,
  }
});