import type { NextApiRequest, NextApiResponse } from 'next';
import { Graph } from '../../../lib/graph';
import { ACCEPT_HEADER, ACTIVITYSTREAMS_CONTENT_TYPE, CONTENT_TYPE_HEADER, CONTEXT, JSON_CONTENT_TYPE, LINKED_DATA_CONTENT_TYPE, LOCAL_DOMAIN, PUBLIC_ACTOR } from '../../../lib/globals';
import * as AP from '../../../lib/types/activity_pub';
import { getTypedThing } from '../../../lib/utilities/getTypedThing';
import { renderToString } from 'react-dom/server';
import { APAnyThing } from '../../../lib/classes/activity_pub';
import Link from 'next/link';
import inboxHandler from '../[username]/inbox';
import outboxHandler from '../[username]/outbox';
import { ThingCard } from '../../../components/ThingCard';
import { getId } from '../../../lib/utilities/getId';

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

      
      {Array.isArray(actor.streams) ? actor.streams.map(stream => <>
        {typeof stream === 'string' ? <><li><a href={stream}>{stream}</a></li></> : <>
          <li>
            <a href={stream.id ?? '#'}>
              {stream.name ?? stream.id ?? ''}
            </a>
          </li>
        </>}
      </>) : <></>}
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
  
  const graph = await Graph.connect();

  if (!Array.isArray(collection.items)) {
    return <>No Items.</>
  }

  return <>
    <div className="intro">
      <h1>{collection.name ?? 'Collection'}</h1>
    </div>
    <ul>
    {await Promise.all(collection.items.map(async item => {
      const itemId = getId(item);

      if (!itemId) {
        return <>{JSON.stringify(item)}</>;
      }
      const foundItem = await graph.queryById(itemId);
      if (!foundItem) {
        return <>{JSON.stringify(item)}</>;
      }
      const likesCount = 'likes' in foundItem && foundItem.likes ? await getCount(foundItem.likes) : 'unknown';
      const sharesCount = 'shares' in foundItem && foundItem.shares ? await getCount(foundItem.shares) : 'unknown';
      const thing = 'likes' in foundItem ? {
        ...foundItem,
        likes: {
          totalItems: likesCount
        },
        shares: {
          totalItems: sharesCount
        }
      } : item;

        return (
          <ThingCard
            thing={foundItem}
            key={foundItem.id}
          ></ThingCard>
        );
      }))}
    </ul>
  </>;
}

async function renderOrderedCollection(collection: AP.OrderedCollection) {
  if (!Array.isArray(collection.orderedItems)) {
    return <>No Items.</>
  }

  const graph = await Graph.connect();

  const orderedItems = await Promise.all(collection.orderedItems.map(async item => {
    if (typeof item === 'string') {
      return await graph.queryById(item) ?? item;
    } else {
      return item;
    }
  }));

  return <>
    <div className="intro">
      <h1>{collection.name ?? 'Collection'}</h1>
    </div>
    <ol reversed>
      {await Promise.all(orderedItems.map(async item => {
        const likesCount = typeof item !== 'string' && 'likes' in item && item.likes ? await getCount(item.likes) : 'unknown';
        const sharesCount = typeof item !== 'string' && 'shares' in item && item.shares ? await getCount(item.shares) : 'unknown';
        const thing = typeof item !== 'string' && 'likes' in item ? {
          ...item,
          likes: {
            totalItems: likesCount
          },
          shares: {
            totalItems: sharesCount
          }
        } : item;

        return (
          <ThingCard
            thing={thing}
            key={typeof item === 'string' ? item : item.id}
          ></ThingCard>
        );
      }))}
    </ol>
  </>;
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
    return await renderOrderedCollection(thing);
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
  res: NextApiResponse<string|AP.AnyThing| {
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

  if (req.headers.accept?.includes(ACTIVITYSTREAMS_CONTENT_TYPE) || req.headers.accept?.includes(LINKED_DATA_CONTENT_TYPE) || req.headers.accept?.includes(JSON_CONTENT_TYPE)) {
    res.setHeader(CONTENT_TYPE_HEADER, ACTIVITYSTREAMS_CONTENT_TYPE);
    return res.status(200).json(expandedThing);
  }

  const html = renderToString(
    <html>
      <style>{`* {
  box-sizing: border-box;
}

html {
  min-height: 100%;
  display: flex;
  width: 100%;
  flex-direction: column;
}

body {
  font-family: system-ui, sans-serif;
  display: flex;
  height: 100%;
  width: 100%;
  margin: 0;
  flex-direction: column;
  flex: 1;
}

a {
  color: inherit;
}

* {
  box-sizing: border-box;
}

dt {
  font-weight: bold;
}

dd {
  margin-left: 20px;
}

form,
fieldset {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  flex-direction: column;
}

label {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

input,
textarea {
  padding: 4px 8px;
  border: 1px solid lightgray;
  box-shadow: none;
  font: inherit;
  width: 100%;
}

figure {
  margin: 0;
  padding: 0;
  display: flex;
  gap: 12px;
  flex-direction: column;
}

.a-button,
.tabs a,
button,
summary {
  padding: 8px 18px 10px;
  border: 1px solid lightgray;
  box-shadow: none;
  font: inherit;
  cursor: pointer;
  justify-self: flex-end;
  align-self: flex-end;
  line-height: 1;
  border-radius: 8px;
  font-weight: bold;
  background-color: rgb(9, 129, 129);
  color: white;
  max-width: max-content;
  text-decoration: none;
}

.a-button:hover,
.tabs a:hover,
button:hover,
summary:hover {
  background: rgb(4, 117, 89);
  background-color: darkcyan;
}

textarea {
  width: 100%;
}

blockquote {
  margin-left: 20px;
  padding: 20px;
  border-radius: 6px;
  border: 1px solid gray;
  background-color: lightcyan;
}

#__next {
  display: flex;
  height: 100%;
  width: 100%;
  flex: 1;
}

main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  flex: 1;
  background: #708080;
  gap: 24px;
  padding: 24px;
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
  justify-content: center;
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

header {
  max-width: min(480px, 100% - 72px);
  display: flex;
  width: 100%;
  justify-content: center;
}

header a {
  text-decoration: none;
}

.tabpanel:not(:target) {
  display: none;
}

.tabpanel {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.tabpanel ol {
  display: flex;
  gap: 36px;
  flex-direction: column;
  width: 100%;
  flex: 1;
  align-items: center;
  margin: 0;
  padding: 0;
  list-style: none;
}

.tabs {
  display: flex;
  gap: 12px;
}

.tabpanels {
  display: flex;
  gap: 12px;
  width: 100%;
}

.tabpanels:not(:has(:target)) > .tabpanel:first-child {
  display: flex;  
}

header a {
  font-size: 36px;
}

.form-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 12px 0;
}

.form-buttons form {
  display: inline-flex;
  width: max-content;
}

.danger {
  background-color: maroon;
}

.danger:hover {
  background-color: red;
}

.action {
  background-color: darkblue;
}

.action:hover {
  background-color: blue;
}

.primary {
  background-color: green;
}

.primary:hover {
  background-color: darkgreen;
}

.intro {
  background: lightcyan;
  max-width: min(980, 100% - 72px);
  min-height: 80px;
  width: 100%;
  border: 1px solid lightgray;
  border-radius: 12px;
  padding: 36px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  box-shadow: 3px 3px 6px rgba(0, 0, 0, .25);
  margin-bottom: 36px;
  max-width: min(480px, 100% - 72px);
}

ul:has(.card),
ol:has(.card) {
  max-width: min(480px, 100% - 72px);
  width: 100%;
  flex-direction: column;
  display: flex;
  gap: 24px;
}
        `}
      </style>
      <body>
        <main>
          <header>
            <Link href="/dashboard">
              {'ActivityWeb'}
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

  res.setHeader(CONTENT_TYPE_HEADER, 'text/html');
  return res.status(200).send(html)
}