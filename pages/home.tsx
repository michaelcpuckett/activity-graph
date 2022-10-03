import { HomePage } from "../components/HomePage";
import { getServerSideProps as getHomeServerSideProps } from "activitypub-core/src/endpoints/home";
import serviceAccount from "../credentials";
import { AP } from "activitypub-core/src/types";
import { allLocations } from "../utilities/locations";
import { Graph } from "activitypub-core/src/graph";

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

  props.actor.streams = streams;

  const locations = await graph.findAll('object', {
    type: AP.ExtendedObjectTypes.PLACE,
  });

  return {
    ...props,
    locations,
  };
});

export default HomePage;