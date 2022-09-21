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
  inboxItems?: AP.AnyThing[];
  outboxItems?: AP.AnyThing[];
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

  const inboxId = actor.inbox ? (typeof actor.inbox === 'string' ? actor.inbox : 'id' in actor.inbox ? actor.inbox.id : '') : '';
  
  if (!inboxId) {
    return {
      props: {
        actor,
      }
    }
  }

  const inbox = await graph.findThingById(inboxId);

  if (!inbox || !('orderedItems' in inbox) || !Array.isArray(inbox.orderedItems)) {
    return {
      props: {
        actor,
      }
    }
  }

  const inboxItems = await Promise.all(inbox.orderedItems.map(async item => {
    if (!item) {
      return null;
    }

    const foundItem = typeof item === 'string' ? await graph.findThingById(item) : item;

    if (!foundItem) {
      return item;
    }

    const expandedItem = await graph.expandThing(foundItem);

    return expandedItem;
}));


  const outboxId = actor.outbox ? (typeof actor.outbox === 'string' ? actor.outbox : 'id' in actor.outbox ? actor.outbox.id : '') : '';
  
  if (!outboxId) {
    return {
      props: {
        actor,
      }
    }
  }

  const outbox = await graph.findThingById(outboxId);

  if (!outbox || !('orderedItems' in outbox) || !Array.isArray(outbox.orderedItems)) {
    return {
      props: {
        actor,
      }
    }
  }

  const outboxItems = (await Promise.all(outbox.orderedItems.map(async item => {
    if (!item) {
      return null;
    }

    const foundItem = typeof item === 'string' ? await graph.findThingById(item) : item;

    if (!foundItem) {
      return item;
    }

    const expandedItem = await graph.expandThing(foundItem);

    return expandedItem;
  })));

  return {
    props: {
      actor,
      outboxItems,
      inboxItems,
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
    object: body.id ?? {
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
  .then((result: { error?: string; }) => {
    if (result.error) {
      throw new Error(result.error);
    }
    console.log(result);
    window.location.reload();
  });
};

const getNavHtml = (actor: AP.AnyActor) => <>
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
</>;

const getFormHtml = (actor: AP.AnyActor) => <>
  <form
    onSubmit={handleOutboxSubmit(AP.ActivityTypes.CREATE, actor)}
    noValidate>
    <select name="type" defaultValue={'Note'}>
      {Object.values(AP.ObjectTypes).map(type =>
        <option key={type}>{type}</option>
      )}
    </select>
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
</>

const getBoxHtml = (box: string|AP.OrderedCollection) => {
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

const getBoxItemHtml = (thing: string|AP.AnyThing, actor: AP.AnyActor) => {          
  if (typeof thing !== 'string' && 'actor' in thing) {
    const activityTypeHtml = <>
      <a href={thing.id ?? '#'}>
        {thing.type.toLowerCase()}d
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
    const activityObject = ('object' in thing && thing.object && typeof thing.object !== 'string' && 'type' in thing.object) ? thing.object : null;

    if (activityObject) {
      activityObjectHtml = <>
        a <a href={activityObject.id ?? '#'}>
          {activityObject.type.toLowerCase()}
        </a>
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
      {activityObjectHtml}.
        
      <figure>
        <dl>
          {Object.entries(thing).map(([key, value]) => {
            if (Object.hasOwn(thing, key)) {
              return ['id', 'url', 'type', 'actor', 'object'].includes(key) ? <></> : <>
                <dt key={`dt_${key}`}>
                  {key}
                </dt>
                <dd key={`dd_${key}`}>
                  {typeof value === 'string' ? value : <>
                    <textarea defaultValue={JSON.stringify(value)}></textarea>
                  </>}
                </dd>
              </>
            } else {
              return <></>;
            }
          })}
          <dt>
            object
          </dt>
          <dd>
            <dl>
              {activityObject ? Object.entries(activityObject).map(([key, value]) => {
                if (Object.hasOwn(activityObject, key)) {
                  return ['id', 'url'].includes(key) ? <></> : <>
                    <dt key={`dt_${key}`}>
                      {key}
                    </dt>
                    <dd key={`dd_${key}`}>
                      {typeof value === 'string' ? (value === PUBLIC_ACTOR ? 'Public' : value) : <>
                        <textarea defaultValue={JSON.stringify(value)}></textarea>
                      </>}
                    </dd>
                  </>
                } else {
                  return <></>;
                }
              }) : <></>}
            </dl>
          </dd>
        </dl>
      </figure>

      {activityObject && activityObject.type !== AP.ObjectTypes.TOMBSTONE ? <>
        <form
          onSubmit={handleOutboxSubmit(AP.ActivityTypes.DELETE, actor)}
          noValidate>
          <input type="hidden" name="id" value={activityObject.id ?? ''} />
          <button type="submit">
            Delete
          </button>
        </form>
      </> : <></>}

      <textarea defaultValue={JSON.stringify(thing)}></textarea>
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
  inboxItems,
  outboxItems,
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
      </Head>

      <main>
        <h1>Welcome, @{actor.preferredUsername}</h1>

        {getNavHtml(actor)}

        <h2>Create</h2>
        {getFormHtml(actor)}

        <h2>Inbox</h2>
        <ul className="box">
          {inboxItems?.map(item => getBoxItemHtml(item, actor)) ?? null}
        </ul>

        <h2>Outbox</h2>
        <ul className="box">
          {outboxItems?.map(item => getBoxItemHtml(item, actor)) ?? null}
        </ul>
      </main>
    </div>
  )
}

export default Dashboard;
