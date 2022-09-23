import type { NextApiRequest, NextApiResponse } from 'next';
import { Graph } from '../../../lib/graph';
import { ACCEPT_HEADER, ACTIVITYSTREAMS_CONTENT_TYPE, CONTENT_TYPE_HEADER, CONTEXT, JSON_CONTENT_TYPE, LOCAL_DOMAIN, PUBLIC_ACTOR } from '../../../lib/globals';
import * as AP from '../../../lib/types/activity_pub';
import { getTypedThing } from '../../../lib/utilities/getTypedThing';
import { renderToString } from 'react-dom/server';
import { APAnyThing } from '../../../lib/classes/activity_pub';
import Link from 'next/link';
import inboxHandler from '../[username]/inbox';
import outboxHandler from '../[username]/outbox';

async function renderActivity(activity: AP.Activity) {
  const graph = await Graph.connect();
  const actorId = typeof activity.actor === 'string' ? activity.actor : Array.isArray(activity.actor) ? '' : activity.actor.id;
  
  if (!actorId) {
    return '';
  }
  
  const actor = await graph.findThingById(actorId);
  
  if (!actor || !('preferredUsername' in actor) || !actor.id) {
    return '';
  }

  let object = null;

  if (typeof activity.object === 'string') {
    object = await graph.findThingById(activity.object);
  }  

  let target = null;

  if (typeof activity.target === 'string') {
    target = await graph.findThingById(activity.target);
  }

  return <div className="card">
    <h1>{activity.type}{target ? <> to {target.name}</> : ''}</h1>
    <blockquote>
      {object?.type === AP.ActorTypes.PERSON ||
      object?.type === AP.ActorTypes.APPLICATION ||
      object?.type === AP.ActorTypes.GROUP ||
      object?.type === AP.ActorTypes.ORGANIZATION ||
      object?.type === AP.ActorTypes.SERVICE ? <>@</> : <></>}{object && 'summary' in object ? object.summary : object?.name ?? object?.type}
    </blockquote>
    <dl>
      <>
        <dt>
          Created
        </dt>
        <dd>
          {activity.published ? new Date(activity.published).toDateString() : ''}
        </dd>
        
        <dt>
          Performed by
        </dt>
        <dd>
          <a href={actor.id}>
            @{actor.preferredUsername}
          </a>
        </dd>

        {object ? <>
          <dt>
            Object
          </dt>
          <dd>
            <a href={object.id ?? '#'}>
              {object?.name ?? object?.type}
            </a>
          </dd>
        </> : <></>}

        {target ? <>
          <dt>
            Target
          </dt>
          <dd>
            <a href={target.id ?? '#'}>
              {target?.name ?? target?.type}
            </a>
          </dd>
        </> : <></>}
      </>
    </dl>
  </div>;
}

async function renderActor(actor: AP.Actor) {
  const likesCount = await getCount(actor.likes);
  const sharesCount = await getCount(actor.shares);

  return <div className="card">
    <h1>@{actor.preferredUsername}</h1>
    <blockquote>
      {actor.summary ?? '<No bio yet.>'}
    </blockquote>
    <dl>
      <>
        <dt>
          Created
        </dt>
        <dd>
          {actor.published ? new Date(actor.published).toDateString() : ''}
        </dd>

        <dt>
            Likes Count
        </dt>
        <dd>
          {likesCount}
        </dd>

        <dt>
          Shares Count
        </dt>
        <dd>
          {sharesCount}
        </dd>
      </>
    </dl>
    <ul>
      {[typeof actor.inbox === 'string' ? actor.inbox : actor.inbox.id].map(id => <>
        <li>
          <a href={id ?? '#'}>
            Inbox
          </a>
        </li>
      </>)}
      {[typeof actor.outbox === 'string' ? actor.outbox : actor.outbox.id].map(id => <>
        <li>
          <a href={id ?? '#'}>
            Outbox
          </a>
        </li>
      </>)}
      
      {[actor.following ? (typeof actor.following === 'string' ? actor.following : actor.following.id) : ''].map(id => <>
        <li>
          <a href={id ?? '#'}>
            Following
          </a>
        </li>
      </>)}
      
      {[actor.followers ? (typeof actor.followers === 'string' ? actor.followers : actor.followers.id) : ''].map(id => <>
        <li>
          <a href={id ?? '#'}>
            Followers
          </a>
        </li>
      </>)}

      {[typeof actor.liked === 'string' ? actor.liked : actor.liked?.id ?? ''].map(id => <>
        <li>
          <a href={id ?? '#'}>
            Liked
          </a>
        </li>
      </>)}
    </ul>
  </div>;
}

async function getAttributedTo(attributedTo?: AP.ObjectOrLinkReference) {
  const graph = await Graph.connect();

  if (typeof attributedTo === 'string') {
    const foundThing = await graph.findThingById(attributedTo);

    if (!foundThing) {
      return '';
    }

    for (const actorType of Object.values(AP.ActorTypes)) {
      if (foundThing.type === actorType) {
        return foundThing;
      }
    }

    return '';
  }
}

async function getCount(collection?: string | AP.Collection | AP.OrderedCollection): Promise<string> {
  const graph = await Graph.connect();

  if (typeof collection === 'string') {
    const foundThing = await graph.findThingById(collection);

    if (foundThing && (foundThing.type === AP.CollectionTypes.COLLECTION || foundThing.type === AP.CollectionTypes.ORDERED_COLLECTION)) {
      if (foundThing.totalItems) {
        return `${foundThing.totalItems}`;
      }
    }
  } else if (collection && collection.totalItems) {
    return `${collection.totalItems}`;
  }

  return `${0}`;
}

async function renderNote(note: AP.Object) {
  const attributedTo = await getAttributedTo(note.attributedTo);
  const likesCount = await getCount(note.likes);
  const sharesCount = await getCount(note.shares);

  return <>
    <div className="card">
      <h1>
        {note.summary ?? 'A post'}
      </h1>
      <blockquote>{note.content}</blockquote>
      <dl>
        <>
          <dt>By</dt>
          <dd>
            <>{typeof attributedTo !== 'string' ? <>
              <a href={attributedTo?.id ?? '#'}>
                @{attributedTo?.preferredUsername}
              </a>
            </> : ''}</>
          </dd>

          <dt>To</dt>
          <dd>
            <>{note.to === PUBLIC_ACTOR ? 'Public' : note.to}</>
          </dd>

          <dt>Published</dt>
          <dd>
            {note.published ? new Date(note.published).toDateString() : ''}
          </dd>

          <dt>
            Updated
          </dt>
          <dd>
            {note.updated ? new Date(note.updated).toDateString() : ''}
          </dd>

          <dt>Location</dt>
          <dd>
            <>{note.location ?? ''}</>
          </dd>

          <dt>
            <>Likes Count</>
          </dt>
          <dd>
            <>{likesCount}</>
          </dd>

          <dt>
            Shares Count
          </dt>
          <dd>
            <>{sharesCount}</>
          </dd>
          {/* Like & Share if logged in */}
        </>
      </dl>
    </div>
  </>
}

async function renderObject(object: AP.Object) {
  if (object.type === AP.ObjectTypes.NOTE) {
    return await renderNote(object);
  }
  return <div className="card">
    <h1>
      <>
        A {object.type}
      </>
    </h1>
  </div>;
}

async function renderLink(link: AP.Link) {
  return <>
    TODO.
  </>;
}

async function renderCollection(collection: AP.Collection) {
  if (!Array.isArray(collection.items)) {
    return <>No Items.</>
  }

  return <div className="card">
    <h1>{collection.name ?? 'Collection'}</h1>
    <ul>
      {Array.isArray(collection.items) ? collection.items.map(item => {
        return <li key={typeof item === 'string' ? item : item.id}>
          <a href={typeof item === 'string' ? item : item.id ?? '#'}>
            {typeof item === 'string' ? item : 'summary' in item ? item.summary : item.name ?? item.id}
          </a>
        </li>
      }) : <></>}
    </ul>
  </div>;
}

async function renderOrderedCollection(collection: AP.OrderedCollection) {
  if (!Array.isArray(collection.orderedItems)) {
    return <>No Items.</>
  }

  const graph = await Graph.connect();

  const orderedItems = await Promise.all(collection.orderedItems.map(async item => {
    if (typeof item === 'string') {
      return await graph.findThingById(item) ?? item;
    } else {
      return item;
    }
  }));

  return <div className="card">
    <h1>{collection.name ?? 'Collection'}</h1>
    <ol reversed>
      {orderedItems.map(item => {
        return <li key={typeof item === 'string' ? item : item.id}>
          <a href={typeof item === 'string' ? item : item.id ?? '#'}>
            {typeof item === 'string' ? item : 'summary' in item ? item.summary : item.name ?? item.id}
          </a>
        </li>;
      })}
    </ol>
  </div>;
}

async function renderCollectionPage(collection: AP.CollectionPage) {
  return <>
    TODO.
  </>;
}

async function renderUnknownThing(thing: AP.Thing) {
  return <>
    TODO.
  </>;
}

async function renderThing(thing: APAnyThing) {
  for (const type of Object.values(AP.ActivityTypes)) {
    if (thing.type === type) {
      return await renderActivity(thing);
    }
  }
  
  for (const type of Object.values(AP.ActorTypes)) {
    if (thing.type === type) {
      return await renderActor(thing);
    }
  }

  for (const type of Object.values(AP.ObjectTypes)) {
    if (thing.type === type) {
      return await renderObject(thing);
    }
  }

  if (thing.type === AP.CollectionTypes.COLLECTION) {
    return await renderCollection(thing);
  }

  if (thing.type === AP.CollectionTypes.ORDERED_COLLECTION) {
    return await renderOrderedCollection(thing as AP.OrderedCollection); // TODO!
  }

  for (const type of Object.values(AP.CollectionPageTypes)) {
    if (thing.type === type) {
      return await renderCollectionPage(thing);
    }
  }

  for (const type of Object.values(AP.LinkTypes)) {
    if (thing.type === type) {
      return await renderLink(thing);
    }
  }

  return await renderUnknownThing(thing);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string|AP.AnyThing & {
    [CONTEXT]: string|string[];
  } | {
    error?: string;
  }>
) {
  const url = `${LOCAL_DOMAIN}${req.url}`;

  console.log(url);

  const [, , , collection] = new URL(url).pathname.split('/');

  if (collection === 'inbox' && req.method === 'POST') {
    return await inboxHandler(req, res);
  }
  
  if (collection === 'outbox' && req.method === 'POST') {
    return await outboxHandler(req, res);
  }

  const graph = await Graph.connect();
  const thing = await graph.findThingById(url);

  if (!thing) {
    return res.status(400).json({
      error: 'Could not locate thing.',
    });
  }

  const typedThing = getTypedThing(thing);

  if (!typedThing) {
    return res.status(400).json({
      error: 'Could not locate thing.',
    });
  }

  const expandedThing = await graph.expandThing(typedThing.formatPublicObject());

  console.log('ACCEPTS', req.headers[ACCEPT_HEADER]);
  
  if (req.headers[ACCEPT_HEADER]?.includes(ACTIVITYSTREAMS_CONTENT_TYPE) || req.headers[ACCEPT_HEADER]?.includes(JSON_CONTENT_TYPE)) {
    res.setHeader(CONTENT_TYPE_HEADER, ACTIVITYSTREAMS_CONTENT_TYPE);
    return res.status(200).json(JSON.stringify(expandedThing));
  }

  const html = renderToString(
    <html>
      <style>{`
          * {
            box-sizing: border-box;
          }

          html {
            min-height: 100%;
            display: flex;
            width: 100%;
          }

          body {
            font-family: system-ui, sans-serif;
            display: flex;
            height: 100%;
            width: 100%;
            margin: 0;
          }

          main:has(.card) {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            background: #708080;
            gap: 24px;
          }

          .card {
            background: lightcyan;
            max-width: min(480px, 100% - 72px);
            min-height: 320px;
            width: 100%;
            border: 1px solid lightgray;
            border-radius: 12px;
            padding: 36px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            box-shadow: 3px 3px 6px rgba(0, 0, 0, .25);
          }

          .card h1,
          .card h2 {
            margin: 0;
            font-size: 1.25em;
          }

          .card blockquote {
            margin: 0;
            padding: 36px;
            border: 1px solid lightgray;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
          }

          .card dl,
          .card dt,
          .card dd {
            margin: 0;
            padding: 0;
          }

          .card dt {
            font-weight: bold;
            padding-right: 4px;
          }

          .card dt,
          .card dd {
            width: 50%;
            padding-bottom: 5px;
            padding-top: 5px;
            border-bottom: 1px solid lightgray;
          }

          .card dl {
            display: flex;
            flex-wrap: wrap;
          }

          .card + details {
            display: flex;
            width: 100%;
            max-width: min(480px, 100% - 72px);
          }

          .card + details summary {
            text-align: right;
          }

          .card + details textarea {
            width: 100%;
            min-height: 250px;
          }

          header {
            max-width: min(480px, 100% - 72px);
            display: flex;
            width: 100%;
          }

          header a {
            text-decoration: none;
            background: #376161;
            border: 1px solid #FAFFFF;
            color: white;
            padding: 8px 12px;
            border-radius: 8px;
            vertical-align: top;
            line-height: 1;
          }
        `}
      </style>
      <body>
        <main>
          <header>
            <Link href="/dashboard">
              {'< ActivityWeb'}
            </Link>
          </header>
          {await renderThing(typedThing)}
          <details>
            <summary>
              Raw
            </summary>
            <textarea>
              {JSON.stringify(typedThing)}
            </textarea>
          </details>
        </main>
      </body>
    </html>
  );

  return res.status(200).send(html)

  // return res.status(200).json(typedThing.formatPublicObject());
}