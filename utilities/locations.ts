import { getGuid } from 'activitypub-core/src/crypto';
import { LOCAL_DOMAIN, LOCAL_HOSTNAME, PORT, PROTOCOL } from 'activitypub-core/src/globals';
import { AP } from 'activitypub-core/src/types';

const locations = [{
  name: 'Pallet Town',
  summary: 'A small sleepy town',
  'poke:nearbyPokemon': [
    `rattata`,
    `pidgey`,
  ],
  'poke:starterPokemon': [
    `bulbasaur`,
    `charmander`,
    `pikachu`,
  ],
}, {
  name: 'Lavendar Town',
  summary: 'Town of ghosts and magic',
  'poke:nearbyPokemon': [
    `grimer`,
    `koffing`,
  ],
  'poke:starterPokemon': [
    `gastly`,
    `abra`,
    `drifloon`,
  ],
}, {
  name: 'Cerulean City',
  summary: 'Seaside town full of spirit',
  'poke:nearbyPokemon': [
    `spearow`,
    `geodude`,
  ],
  'poke:starterPokemon': [
    `togepi`,
    `squirtle`,
    `dratini`,
  ],
}, {
  name: 'Ecruteak City',
  summary: 'Traditional and historic',
  'poke:nearbyPokemon': [
    `unown`,
    `weedle`,
  ],
  'poke:starterPokemon': [
    `ralts`,
    `growlithe`,
    `eevee`,
  ],
}, {
  name: 'Violet City',
  summary: 'New adventures begin here',
  'poke:nearbyPokemon': [
    `spinarak`,
    `metapod`,
  ],
  'poke:starterPokemon': [
    `chikorita`,
    `cynadquil`,
    `totodile`,
  ],
  
}];

/*
          'Togepi', // Fairy
          'Larvitar', // Dark
          'Tyrogue', // Fighting
          'Gible', // Dragon
          'Ralts', // Psychic
          'Riolu', // Steel*/

export const allLocations: AP.Place[] = locations.map((location) => {
  const id = `${PROTOCOL}//${LOCAL_HOSTNAME}${
    PORT ? `:${PORT}` : ''
  }/object/${getGuid()}`;
  return {
    id: new URL(id),
    url: new URL(id),
    type: AP.ExtendedObjectTypes.PLACE,
    ...location,
  };
});
