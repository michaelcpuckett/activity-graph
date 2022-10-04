import { HomePage } from "../components/HomePage";
import { getServerSideProps as getHomeServerSideProps } from "activitypub-core/src/endpoints/home";
import serviceAccount from "../credentials";
import { AP } from "activitypub-core/src/types";
import { Graph } from "activitypub-core/src/graph";
import { unprefixPkmnData } from "../utilities/unprefixPkmnData";

export const getServerSideProps = getHomeServerSideProps(serviceAccount, async (props: {
  actor: AP.Actor,
}, graph: Graph) => {
  const streams: AP.EitherCollection[] = [];

  for (const stream of props.actor.streams || []) {
    if (stream instanceof URL) {
      const expanded = await graph.expandCollection(stream);

      if (expanded) {
        streams.push(expanded);
      }
    } else if (stream) {
      streams.push(stream);
    }
  }

  const speciesData: {[key: string]: AP.Document} = {};

  for (const stream of streams) {
    if (stream.name === 'Pokemon' && 'orderedItems' in stream && Array.isArray(stream.orderedItems)) {
      for (const orderedItem of [...stream.orderedItems]) {
        if ('name' in orderedItem && orderedItem.name) {
          const species = await graph.findOne('species', {
            'poke:name': orderedItem.name.toLowerCase(),
          });
          if (species && species.type === AP.ExtendedObjectTypes.DOCUMENT) {
            speciesData[orderedItem.name.toLowerCase()] = unprefixPkmnData(JSON.parse(JSON.stringify(species)) as unknown as {[key: string]: unknown}) as unknown as AP.Document;
          }
        }
      }
    }
  }

  props.actor.streams = streams;

  const locations = await graph.findAll('object', {
    type: AP.ExtendedObjectTypes.PLACE,
  });

  if (!locations || !Array.isArray(locations)) {
    throw new Error('Bad!')
  }

  for (const location of locations) {
    console.log(location)
  }

  return {
    ...props,
    locations,
    speciesData,
  };
});

export default HomePage;