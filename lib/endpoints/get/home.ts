import { IncomingMessage } from 'http';
import * as AP from '../../types/activity_pub';
import { Graph } from '../../graph';

export const getServerSideProps = async ({ req }: { req: IncomingMessage & { cookies: { __session?: string; } } }) => {
  const graph = await Graph.connect();
  const actor = await graph.getActorByToken(req.cookies.__session ?? '');

  if (!actor) {
    return {
      props: {
        actor,
      }
    }
  }

  const followers = await graph.getCollectionItems(actor.followers ?? '');
  const following = await graph.getCollectionItems(actor.following ?? '');
  const inboxItems = await graph.getCollectionItems(actor.inbox);
  const outboxItems = await graph.getCollectionItems(actor.outbox);

  if (!(Array.isArray(actor.streams) && [...actor.streams].every(stream => typeof stream === 'string'))) {
    return {
      props: {
        actor,
        inbox: inboxItems,
        outbox: outboxItems,
        followers,
        following,
      }
    }
  }

  const streams: AP.AnyCollection[] = [];

  for (const stream of actor.streams) {
    const collection = await graph.expandCollection(stream);
    streams.push(JSON.parse(JSON.stringify(collection)));
  }

  return {
    props: {
      actor,
      outboxItems,
      inboxItems,
      streams,
      following,
      followers,
    }
  }
}