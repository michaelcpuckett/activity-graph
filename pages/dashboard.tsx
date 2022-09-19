import Head from 'next/head'
import { IncomingMessage } from 'http';
import Home from '.';

import { FormEventHandler, MouseEventHandler } from 'react';

import { ACTIVITYSTREAMS_CONTEXT } from '../lib/globals';
import * as AP from '../lib/types/activity_pub';
import { Graph } from '../lib/graph';

const PUBLIC_ACTOR = `${ACTIVITYSTREAMS_CONTEXT}#Public`;

type Data = {
  actor: AP.Actor|null;
}

export const getServerSideProps = async ({req}: {req: IncomingMessage & { cookies: { __session?: string; } }}) => {
  const graph = await Graph.connect();
  const actor = await graph.getActorByToken(req.cookies.__session ?? '')

  if (!actor) {
    return {
      props: {
        actor: null,
      }
    }
  }

  return {
    props: {
      actor,
    }
  };
}

function Dashboard({
  actor,
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
      </main>
    </div>
  )
}

export default Dashboard;
