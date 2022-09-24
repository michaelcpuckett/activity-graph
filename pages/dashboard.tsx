import Head from 'next/head'
import { IncomingMessage } from 'http';
import Home from '.';

import { ChangeEvent, ChangeEventHandler, FormEventHandler, MouseEventHandler, useState } from 'react';

import { ACTIVITYSTREAMS_CONTEXT } from '../lib/globals';
import * as AP from '../lib/types/activity_pub';
import { Graph } from '../lib/graph';
import { APAnyThing, APCollection, APOrderedCollection } from '../lib/classes/activity_pub';
import Link from 'next/link';
import { ThingCard } from '../components/ThingCard';
import { getId } from '../lib/utilities/getId';

const PUBLIC_ACTOR = `${ACTIVITYSTREAMS_CONTEXT}#Public`;

type Data = {
  actor: AP.Actor|null;
  inboxItems?: AP.AnyThing[];
  outboxItems?: AP.AnyThing[];
  streams?: AP.AnyCollection[];
  following?: AP.AnyActor[];
  followers?: AP.AnyActor[];
}

export const getServerSideProps = async ({req}: {req: IncomingMessage & { cookies: { __session?: string; } }}) => {
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

  // for (const stream of actor.streams) {
  //   const collection = await graph.expandCollection(stream);
  //   streams.push(JSON.parse(JSON.stringify(collection)));
  // }

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

const handleOutboxSubmit = (activityType: typeof AP.ActivityTypes[keyof typeof AP.ActivityTypes], actor: AP.AnyActor): FormEventHandler<HTMLFormElement> => event => {
  event.preventDefault();
  const formElement = event.currentTarget;
  const { elements } = formElement;

  if (!(formElement instanceof HTMLFormElement)) {
    return;
  }

  let formElements: Array<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement> = [];

  for (const element of elements) {
    if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement) {
      formElements.push(element);
    }
  }

  const isValid = formElements.find(element => element.checkValidity());

  if (!isValid) {
    return;
  }

  const body = Object.fromEntries(formElements.map(formElement => [
    formElement.getAttribute('name'),
    formElement.value
  ]));

  for (const element of elements) {
    if (element instanceof HTMLFieldSetElement) {
      const fieldsetValue = [];

      for (const inputElement of element.elements) {
        if (inputElement instanceof HTMLInputElement && inputElement.checked) {
          fieldsetValue.push(inputElement.value);
        }
      }

      body[element.name] = fieldsetValue;
    }
  }

  if (!actor.id) {
    return;
  }

  const activity: AP.Activity = {
    type: activityType,
    actor: actor.id,
    ...body.target ? {
      target: body.target
    } : null,
    object: (
      AP.ActivityTypes.LIKE === activityType || 
      AP.ActivityTypes.ANNOUNCE === activityType ||
      AP.ActivityTypes.DELETE === activityType||
      AP.ActivityTypes.ADD === activityType ||
      AP.ActivityTypes.REMOVE === activityType
    ) ? body.id : {
      ...body.id ? {
        id: body.id
      } : null,
      type: body.type,
      ...body.content ? {
        content: body.content,
      } : null,
      ...body.summary ? {
        summary: body.summary,
      } : null,
      ...body.location ? {
        location: body.location,
      } : null,
    },
    ...body.to ? {
      to: body.to,
    } : null,
  };

  fetch(`${typeof actor.outbox === 'string' ? actor.outbox : actor.outbox.id}`, {
    method: 'POST',
    body: JSON.stringify(activity)
  })
  .then(response => response.json())
  .then((result: { error?: string; type?: string; }) => {
    if (result.error) {
      throw new Error(result.error);
    }
    console.log(result);
    if ('type' in result && result.type === AP.ActivityTypes.CREATE) {
      window.location.hash = 'outbox';
    }
    window.location.reload();
  });
};

const getNavHtml = (actor: AP.AnyActor, streams?: AP.AnyCollection[]) => {
  return <>
    <nav>
      <ul>
        {typeof actor.url === 'string' ? (
          <li>
            <a href={actor.url}>
              You
            </a>
          </li>
        ) : null}
        {getBoxLinkHtml(actor.inbox, 'Inbox')}
        {getBoxLinkHtml(actor.outbox, 'Outbox')}
        {actor.following ? getBoxLinkHtml(actor.following, 'Following') : <></>}
        {actor.followers ? getBoxLinkHtml(actor.followers, 'Followers') : <></>}
        {actor.liked ? getBoxLinkHtml(actor.liked, 'Liked') : <></>}
        {streams ? streams.map(stream => (typeof stream !== 'string' && 'id' in stream && stream.id && 'name' in stream && stream.name && !Array.isArray(stream.name)) ? getBoxLinkHtml(stream.id, stream.name) : <></>) : <></>}
      </ul>
    </nav>
  </>
};

const getFormHtml = (actor: AP.AnyActor) => <>
  <form
    onSubmit={handleOutboxSubmit(AP.ActivityTypes.CREATE, actor)}
    noValidate>
    <label>
      <span>
        Type
      </span>
      <select name="type" defaultValue={'Note'}>
        {Object.values(AP.ObjectTypes).map(type =>
          <option key={type}>{type}</option>
        )}
      </select>
    </label>
    <label>
      <span>Summary</span>
      <textarea name="summary"></textarea>
    </label>
    <label>
      <span>Content</span>
      <textarea required name="content"></textarea>
    </label>
    <label>
      <span>Location</span>
      <input type="text" name="location" />
    </label>
    <fieldset name="to">
      <label>
        <span>
          Public
        </span>
        <input defaultChecked={true} type="checkbox" name="to" value={PUBLIC_ACTOR} />
      </label>
      <label>
        <span>
          Followers
        </span>
        <input defaultChecked={true} type="checkbox" name="to" value={actor.followers ? typeof actor.followers === 'string' ? actor.followers : actor.followers.id ?? '' : ''} />
      </label>
    </fieldset>
    <button type="submit">
      Submit
    </button>
  </form>
</>

const getBoxLinkHtml = (collection: string|AP.AnyCollection, slotText: string) => {
  return typeof collection === 'string' ? (
    <li>
      <a href={collection}>
        {slotText}
      </a>
    </li>
  ) : typeof collection.url === 'string' ? (
    <li>
      <a href={collection.url}>
        {slotText}
      </a>
    </li>
  ) : null
}

function Dashboard({
  actor,
  inboxItems,
  outboxItems,
  streams = [],
  following = [],
  followers = [],
}: Data) {

  const [filter, setFilter]: [filter: string, setFilter: Function] = useState(AP.ActivityTypes.CREATE);

  if (!actor) {
    return <Home />;
  }

  const getBoxHtml = (thing: AP.AnyThing) => <ThingCard
    thing={thing}
    actor={actor}
    streams={streams}
    handleOutboxSubmit={handleOutboxSubmit}
    key={typeof thing === 'string' ? thing : thing.id ?? ''}
    filter={filter}
  ></ThingCard>;

  const handleFilterChange: ChangeEventHandler<HTMLSelectElement> = (event: ChangeEvent<HTMLSelectElement>) => {
    setFilter(event.currentTarget.value);
  }

  return (
    <>
      <Head>
        <title>ActivityWeb</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <header>
          <Link href="/dashboard">
            {'ActivityWeb'}
          </Link>
        </header>

        <div className="tabs">
          <a href="#welcome">Welcome</a>
          <a href="#create">Create</a>
          <a href="#inbox">Inbox</a>
          <a href="#outbox">Outbox</a>
          <a href="#search">Search</a>
        </div>

        <div className="tabpanels">
          <div className="tabpanel" id="welcome">
            <div className="card">
              <h1>Welcome, @{actor.preferredUsername}</h1>
              {getNavHtml(actor, streams)}
              <h2>
                Following
              </h2>
              <ul>
                {following.map(item => (
                  <li key={item.id}>
                    <a href={item.id ?? ''}>
                      @{item.preferredUsername}
                    </a>
                  </li>
                ))}
              </ul>
              <h2>
                Followers
              </h2>
              <ul>
                {followers.map(item => (
                  <li key={item.id}>
                    <a href={item.id ?? ''}>
                      @{item.preferredUsername}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="tabpanel" id="create">
            <div className="card">
              <h2>Create</h2>
              {getFormHtml(actor)}
            </div>
          </div>

          <div className="tabpanel" id="inbox">
            <div className="intro">
              <h2>Inbox</h2>
              <form>
                <label>
                  <span>
                    Filter
                  </span>
                  <select onChange={handleFilterChange} defaultValue={filter}>
                    <option>All Activity</option>
                    <option value={AP.ActivityTypes.CREATE}>All Creations</option>
                  </select>
                </label>
              </form>
            </div>
            <ol>
              {inboxItems?.map(getBoxHtml) ?? null}
            </ol>
          </div>

          <div className="tabpanel" id="outbox">
            <div className="intro">
              <h2>Outbox</h2>
              <form>
                <label>
                  <span>
                    Filter
                  </span>
                  <select onChange={handleFilterChange} value={filter}>
                    <option>All Activity</option>
                    <option value={AP.ActivityTypes.CREATE}>All Creations</option>
                  </select>
                </label>
              </form>
            </div>
            <ol>
              {outboxItems?.map(getBoxHtml) ?? null}
            </ol>
          </div>
          <div className="tabpanel" id="search">
            <div className="intro">
              <h2>Follow a User</h2>
              <form
                onSubmit={handleOutboxSubmit(AP.ActivityTypes.FOLLOW, actor)}
                noValidate>
                <label>
                  <span>URL</span>
                  <input name="id" />                  
                </label>
                <label>
                  <span>To</span>
                  <input name="to" />                  
                </label>
                <button type="submit">
                  Follow
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default Dashboard;
