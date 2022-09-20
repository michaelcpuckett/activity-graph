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
  const actor = await graph.getActorByToken(req.cookies.__session ?? '');

  return {
    props: {
      actor: actor ? await graph.expandThing(actor) : null,
    }
  }
}

const getBox = (box: string|AP.OrderedCollection) => {
  return (
    box &&
    typeof box !== 'string' &&
    'id' in box &&
    typeof box?.id === 'string' &&
    box.orderedItems &&
    typeof box.orderedItems !== 'string' &&
    'orderedItems' in box &&
    Array.isArray(box.orderedItems)
  ) ? box.orderedItems : null;
};

const getBoxItemHtml = (thing: string|AP.AnyThing) => {          
  if (typeof thing !== 'string' && 'actor' in thing) {
    const activityTypeHtml = <>
      <a href={thing.id ?? '#'}>
        {thing.type}d
      </a>
    </>;

    let activityActorHtml = <></>;
    const activityActor = thing.actor;

    if (typeof activityActor !== 'string' && 'inbox' in activityActor) {
      activityActorHtml = <>
        <a href={activityActor.id ?? '#'}>
          @{activityActor.preferredUsername ?? activityActor.id}
        </a>
      </>
    } else if (typeof activityActor === 'string') {
      activityActorHtml = <>
        <a href={activityActor}>
          {activityActor}
        </a>
      </>
    }

    let activityObjectHtml = <></>;
    const activityObject = 'object' in thing ? thing.object : null;

    if (activityObject && typeof activityObject !== 'string' && 'type' in activityObject) {
      activityObjectHtml = <>
        a <a href={activityObject.id ?? '#'}>
          {activityObject.type}
        </a>
        <figure>
          <dl>
            {Object.entries(activityObject).map(([key, value]) => ['id', 'url'].includes(key) ? <></> : <>
              <dt>
                {key}
              </dt>
              <dd>
                {typeof value === 'string' ? (value === PUBLIC_ACTOR ? 'Public' : value) : <>
                  <textarea defaultValue={JSON.stringify(value)}></textarea>
                </>}
              </dd>
            </>)}
          </dl>
        </figure>
      </>
    } else if (typeof activityObject === 'string') {
      activityObjectHtml = <>
        <a href={activityObject}>
          {activityObject}
        </a>
      </>
    }

    return <li key={thing.id}>
      {activityActorHtml}
      {' '}
      {activityTypeHtml}
      {' '}
      {activityObjectHtml}

      <figure>
        <dl>
          {Object.entries(thing).map(([key, value]) => ['id', 'url', 'type', 'actor', 'object'].includes(key) ? <></> : <>
            <dt>
              {key}
            </dt>
            <dd>
              {typeof value === 'string' ? value : <>
                <textarea defaultValue={JSON.stringify(value)}></textarea>
              </>}
            </dd>
          </>)}
        </dl>
      </figure>
    </li>
  }
  return null;
}

const getBoxLinkHtml = (collection: string|AP.OrderedCollection, slotText: string) => {
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
}: Data) {

  if (!actor) {
    return <Home />;
  }

  const handleOutboxSubmit = (activityType: typeof AP.ActivityTypes[keyof typeof AP.ActivityTypes]): FormEventHandler<HTMLFormElement> => event => {
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

    const actorId = actor.id;

    if (!actorId) {
      return;
    }

    const activity: AP.Activity = {
      type: activityType,
      actor: actorId,
      object: {
        ...body.url ? {
          url: body.url,
        } : null,
        type: body.type,
        content: body.content,
        ...body.to ? {
          to: body.to,
        } : null,
      },
    };

    fetch(`/api/${actor.preferredUsername}/outbox`, {
      method: 'POST',
      body: JSON.stringify(activity)
    })
    .then(response => response.json())
    .then(({ error }: { error?: string; }) => {
      if (error) {
        throw new Error(error);
      }

      window.location.reload();
    });
  };

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
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
            {getBoxLinkHtml(actor.inbox, 'Your Inbox')}
            {getBoxLinkHtml(actor.outbox, 'Your Outbox')}
          </ul>
        </nav>
        
        <h2>Create Note</h2>
        <form
          onSubmit={handleOutboxSubmit(AP.ActivityTypes.CREATE)}
          noValidate>
          <input type="hidden" name="type" value="Note" />
          <label>
            <span>Content</span>
            <textarea required name="content"></textarea>
          </label>
          <label>
            <span>To</span>
            <select name="to" defaultValue={PUBLIC_ACTOR}>
              <option value={PUBLIC_ACTOR}>
                Public
              </option>
            </select>
          </label>
          <button type="submit">
            Submit
          </button>
        </form>
        <h2>Inbox</h2>
        <ul className="box">
          {getBox(actor.inbox)?.map(getBoxItemHtml) ?? null}
        </ul>
        <h2>Outbox</h2>
        <ul className="box">
          {getBox(actor.outbox)?.map(getBoxItemHtml) ?? null}
        </ul>
      </main>
    </div>
  )
}

export default Dashboard;
