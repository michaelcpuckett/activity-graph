import { ChangeEvent, ChangeEventHandler, FormEvent, FormEventHandler, MouseEventHandler, ReactElement, useState } from 'react';
import { AP } from 'activitypub-core/src/types';
import { ACCEPT_HEADER, ACTIVITYSTREAMS_CONTENT_TYPE, LOCAL_DOMAIN, LOCAL_HOSTNAME, PORT, PROTOCOL } from 'activitypub-core/src/globals';
import { OutboxFeed } from './OutboxFeed';


export function LocationPage({ player, locations, pokemonCollection, visitedCollection }: { player: AP.Actor, locations: AP.Place[], pokemonCollection: AP.OrderedCollection, visitedCollection: AP.OrderedCollection }) {
  let currentLocation: AP.Place|undefined;

  if (Array.isArray(visitedCollection?.orderedItems)) {
    const lastLocation = visitedCollection?.orderedItems[visitedCollection.orderedItems.length - 1];

    if (lastLocation && !(lastLocation instanceof URL) && lastLocation.type === AP.ExtendedObjectTypes.PLACE) {
      currentLocation = lastLocation;
    }
  }
  
  return <>
    <h1>
      Welcome to {currentLocation?.name}!
    </h1>
    <OutboxFeed player={player} />
  </>
}