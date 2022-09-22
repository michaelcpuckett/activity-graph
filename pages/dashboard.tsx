import Head from 'next/head'
import { IncomingMessage } from 'http';
import Home from '.';

import { FormEventHandler, MouseEventHandler } from 'react';

import { ACTIVITYSTREAMS_CONTEXT } from '../lib/globals';
import * as AP from '../lib/types/activity_pub';
import { Graph } from '../lib/graph';
import { APAnyThing, APCollection, APOrderedCollection } from '../lib/classes/activity_pub';

const PUBLIC_ACTOR = `${ACTIVITYSTREAMS_CONTEXT}#Public`;

type Data = {
  actor: AP.Actor|null;
  inboxItems?: AP.AnyThing[];
  outboxItems?: AP.AnyThing[];
  streams?: AP.AnyCollection[];
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

    console.log(item)

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

  const outboxItems = await Promise.all(outbox.orderedItems.map(async item => {
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

  if (Array.isArray(actor.streams) && [...actor.streams].every(stream => typeof stream === 'string')) {

    const streams: AP.Collection[]|AP.OrderedCollection[] = [];

    for (const stream of actor.streams) {
      if (typeof stream !== 'string') {
        continue;
      }
      
      const foundStream = await graph.findThingById(stream);

      if (!foundStream) {
        continue;
      }

      if ('orderedItems' in foundStream && Array.isArray(foundStream.orderedItems) && foundStream.type === AP.CollectionTypes.ORDERED_COLLECTION) {
        const orderedItems: AP.ObjectOrLinkReference = [];

        for (const orderedItem of [...foundStream.orderedItems]) {
          if (typeof orderedItem === 'string') {
            const foundItem = await graph.findThingById(orderedItem);

            if (!foundItem) {
              continue;
            }

            orderedItems.push(foundItem as never); // TODO
          }
        };

        const collection = new APOrderedCollection({
          ...foundStream,
          orderedItems,
        });

        streams.push(JSON.parse(JSON.stringify(collection)));

        continue;
      }      
      
      if ('items' in foundStream && Array.isArray(foundStream.items) && foundStream.type === AP.CollectionTypes.COLLECTION) {
        const items: AP.ObjectOrLinkReference = [];

        for (const item of [...foundStream.items]) {
          if (typeof item === 'string') {
            const foundItem = await graph.findThingById(item);

            if (foundItem) {
              items.push(foundItem as never); // TODO
            }
          }
        };

        const collection = new APCollection({
          ...foundStream,
          items,
        });

        streams.push(JSON.parse(JSON.stringify(collection)));

        continue;
      }

    }

    return {
      props: {
        actor,
        outboxItems,
        inboxItems,
        streams,
      }
    }
  }

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
    object: activityType === AP.ActivityTypes.LIKE ? body.id : {
      type: body.type,
      ...body.content ? {
        content: body.content,
      } : null,
      ...body.to ? {
        to: body.to,
      } : null,
    },
  };

  console.log(body)

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
      if (activityObject.type === AP.ObjectTypes.TOMBSTONE) {
        activityObjectHtml = <>
          a <a href={activityObject.id ?? '#'}>
            {typeof activityObject.formerType === 'string' ? activityObject.formerType.toLowerCase() : 'deleted thing'}
          </a>
        </>
      } else {
        activityObjectHtml = <>
          a <a href={activityObject.id ?? '#'}>
            {activityObject.type.toLowerCase()}
          </a>
      </>
      }
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
      
      {activityObject && 'content' in activityObject && activityObject.content ? <>
        <blockquote>
          {'> '}
          {activityObject.content}
        </blockquote>
      </> : activityObject && 'preferredUsername' in activityObject && activityObject.preferredUsername ? <>
        <blockquote>
          @{activityObject.preferredUsername}
        </blockquote>
      </> : <></>}

      <details>
        <summary>
          Details
        </summary>
        <figure>
           <textarea defaultValue={JSON.stringify(thing)}></textarea>
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
      </details>

      {activityObject && activityObject.type !== AP.ObjectTypes.TOMBSTONE ? <>
        <form
          onSubmit={handleOutboxSubmit(AP.ActivityTypes.LIKE, actor)}
          noValidate>
          <input type="hidden" name="id" value={activityObject.id ?? ''} />
          <button type="submit">
            Like
          </button>
        </form>
        <details>
          <summary>
            Edit
          </summary>
          <form
            onSubmit={handleOutboxSubmit(AP.ActivityTypes.UPDATE, actor)}
            noValidate>
            <input type="hidden" name="id" value={activityObject.id ?? ''} />
            <label>
              <span>Content</span>
              {'content' in activityObject ? <>
                  <textarea required name="content" defaultValue={activityObject.content}></textarea>
                </> : <>
                  <textarea required name="content"></textarea>
                </>
              }
            </label>
            <button type="submit">
              Update
            </button>
          </form>
        </details>
      </> : <></>}

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

    </li>
  }
  return null;
}

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
  streams,
}: Data) {

  if (!actor) {
    return <Home />;
  }

  const getBoxHtml = (item: AP.AnyThing) => getBoxItemHtml(item, actor);

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Welcome, @{actor.preferredUsername}</h1>

        {getNavHtml(actor, streams)}

        <h2>Create</h2>
        {getFormHtml(actor)}

        <h2>Inbox</h2>
        <ul className="box">
          {inboxItems?.map(getBoxHtml) ?? null}
        </ul>

        <h2>Outbox</h2>
        <ul className="box">
          {outboxItems?.map(getBoxHtml) ?? null}
        </ul>
      </main>
    </div>
  )
}

export default Dashboard;
