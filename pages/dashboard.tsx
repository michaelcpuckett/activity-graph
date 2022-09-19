import Head from 'next/head'
import { IncomingMessage } from 'http';
import Home from '.';

import { FormEventHandler, MouseEventHandler } from 'react';

import { ACTIVITYSTREAMS_CONTEXT } from '../lib/globals';
import * as AP from '../lib/types/activity_pub';
import { Graph } from '../lib/graph';
import { APOrderedCollection } from '../lib/classes/activity_pub';
import { APThing } from '../lib/classes/activity_pub/thing';

const PUBLIC_ACTOR = `${ACTIVITYSTREAMS_CONTEXT}#Public`;

type Data = {
  actor: AP.Actor|null;
  inbox?: Array<AP.AnyThing|null>;
  outbox?: Array<AP.AnyThing|null>;
}

export const getServerSideProps = async ({req}: {req: IncomingMessage & { cookies: { __session?: string; } }}) => {
  const graph = await Graph.connect();
  const actor = await graph.getActorByToken(req.cookies.__session ?? '');

  if (!actor) {
    return {
      props: {
        actor: null,
      }
    }
  }

  const inboxUrl = ('inbox' in actor && typeof actor.inbox === 'string') ? actor.inbox : (typeof actor.inbox === 'string') ? actor.inbox : ('url' in actor.inbox) ? typeof actor.inbox.url === 'string' ? actor.inbox.url : '' : '';
  let inboxItems: Array<AP.AnyThing|null> = [];

  if (inboxUrl) {
    const inbox = await graph.findOne('collection', { _id: inboxUrl });
    if (inbox && 'orderedItems' in inbox && inbox.type === AP.CollectionTypes.ORDERED_COLLECTION) {
      const { orderedItems } = new APOrderedCollection(inbox);

      if (Array.isArray(orderedItems) && orderedItems.length) {
        inboxItems = await Promise.all(orderedItems.map(async (orderedItem): Promise<AP.AnyThing|null> => {
          if (typeof orderedItem === 'string') {
            const item = await graph.findOne(graph.getCollectionNameByUrl(orderedItem), {
              _id: orderedItem,
            });
            if (item && 'type' in item) {
              return item;
            }
            return null;
          } else if ('type' in orderedItem) {
            return orderedItem;
          } else {
            return null;
          }
        }));
      }
    }
  }

  const outboxUrl = ('outbox' in actor && typeof actor.outbox === 'string') ? actor.outbox : (typeof actor.outbox === 'string') ? actor.outbox : ('url' in actor.outbox) ? typeof actor.outbox.url === 'string' ? actor.outbox.url : '' : '';
  let outboxItems: Array<AP.AnyThing|null> = [];

  if (outboxUrl) {
    const outbox = await graph.findOne('collection', { _id: outboxUrl });
    if (outbox && 'orderedItems' in outbox && outbox.type === AP.CollectionTypes.ORDERED_COLLECTION) {
      const { orderedItems } = new APOrderedCollection(outbox);

      if (Array.isArray(orderedItems) && orderedItems.length) {
        outboxItems = await Promise.all(orderedItems.map(async (orderedItem): Promise<AP.AnyThing|null> => {
          if (typeof orderedItem === 'string') {
            const item = await graph.findOne(graph.getCollectionNameByUrl(orderedItem), {
              _id: orderedItem,
            });
            if (item && 'type' in item) {
              return item;
            }
            return null;
          } else if ('type' in orderedItem) {
            return orderedItem;
          } else {
            return null;
          }
        }));
      }
    }
  }

  return {
    props: {
      actor,
      inbox: inboxItems,
      outbox: outboxItems,
    }
  };
}

function Dashboard({
  actor,
  inbox,
  outbox,
}: Data) {

  if (!actor) {
    return <Home />;
  }

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
        <style>{`
          label {
            display: block;
          }
        `}</style>
      </Head>

      <main>
        <h1>Welcome, @{actor.preferredUsername}</h1>
        <nav>
          <ul>
            {typeof actor.url === 'string' ? (
              <li>
                <a href={actor.url}>
                  You
                </a>
              </li>
            ) : null}
            {typeof actor.inbox === 'string' ? (
              <li>
                <a href={actor.inbox}>
                  Your Inbox
                </a>
              </li>
            ) : null}
            {typeof actor.outbox === 'string' ? (
              <li>
                <a href={actor.outbox}>
                  Your Outbox
                </a>
              </li>
            ) : null}
          </ul>
        </nav>
        <h2>Inbox</h2>
        <ul>
          {inbox?.map(thing => thing ? (
            <li key={thing.id}>
              {thing.type}
            </li>
          ) : null)}
        </ul>
        <h2>Outbox</h2>
        <ul>
          {outbox?.map(thing => thing ? (
            <li key={thing.id}>
              {thing.type}
            </li>
          ) : null)}
        </ul>
      </main>
    </div>
  )
}

export default Dashboard;
