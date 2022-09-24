import Head from 'next/head'
import { IncomingMessage } from 'http';
import Home from '.';

import { ChangeEvent, ChangeEventHandler, FormEventHandler, MouseEventHandler, useState } from 'react';

import { ACTIVITYSTREAMS_CONTEXT } from '../lib/globals';
import * as AP from '../lib/types/activity_pub';
import { Graph } from '../lib/graph';
import { APAnyThing, APCollection, APOrderedCollection } from '../lib/classes/activity_pub';
import Link from 'next/link';

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

    const foundItem = typeof item === 'string' ? await graph.queryById(item) : item;

    if (!foundItem) {
      return item;
    }

    const expandedItem = await graph.expandThing(foundItem);

    if (!expandedItem) {
      return item;
    }

    const foundItemLikes = ('object' in expandedItem && expandedItem.object && typeof expandedItem.object === 'object' && !Array.isArray(expandedItem.object) && 'likes' in expandedItem.object && typeof expandedItem.object.likes === 'string') ? await graph.queryById(expandedItem.object.likes) : null;
    const foundItemShares = ('object' in expandedItem && expandedItem.object && typeof expandedItem.object === 'object' && !Array.isArray(expandedItem.object) && 'shares' in expandedItem.object && typeof expandedItem.object.shares === 'string') ? await graph.queryById(expandedItem.object.shares) : null;

    return {
      ...expandedItem,
      ...('object' in expandedItem && typeof expandedItem.object === 'object' && !Array.isArray(expandedItem.object)) ? {
        object: {
          ...expandedItem.object,
          ...foundItemLikes ? {
            likes: foundItemLikes,
          } : null,
          ...foundItemShares ? {
            shares: foundItemShares,
          } : null
        },
      } : null,
    };
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

    const foundItem = typeof item === 'string' ? await graph.queryById(item) : item;

    if (!foundItem) {
      return item;
    }

    const expandedItem = await graph.expandThing(foundItem);

    if (!expandedItem) {
      return item;
    }

    const foundItemLikes = ('object' in expandedItem && expandedItem.object && typeof expandedItem.object === 'object' && !Array.isArray(expandedItem.object) && 'likes' in expandedItem.object && typeof expandedItem.object.likes === 'string') ? await graph.queryById(expandedItem.object.likes) : null;
    const foundItemShares = ('object' in expandedItem && expandedItem.object && typeof expandedItem.object === 'object' && !Array.isArray(expandedItem.object) && 'shares' in expandedItem.object && typeof expandedItem.object.shares === 'string') ? await graph.queryById(expandedItem.object.shares) : null;

    return {
      ...expandedItem,
      ...('object' in expandedItem && typeof expandedItem.object === 'object' && !Array.isArray(expandedItem.object)) ? {
        object: {
          ...expandedItem.object,
          ...foundItemLikes ? {
            likes: foundItemLikes,
          } : null,
          ...foundItemShares ? {
            shares: foundItemShares,
          } : null,
        }
      } : null,
    };
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

const getBoxItemHtml = (thing: string|AP.AnyThing, actor: AP.AnyActor, streams: AP.Collection[], filter: string) => {          
  if (typeof thing !== 'string' && 'actor' in thing) {
    if (filter === AP.ActivityTypes.CREATE) {
      if (thing.type !== AP.ActivityTypes.CREATE) {
        return <></>;
      }
    }

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
          {'target' in thing && thing.target ? <>
            {' '}
            to
            {' '}
            <a href={(typeof thing.target === 'string' ? thing.target : 'id' in thing.target ? thing.target.id : '') ?? ''}>
              {(typeof thing.target === 'string' ? thing.target : 'name' in thing.target ? thing.target.name : '') ?? ''}
            </a>
          </> : <></>}
        </>
      } else {
        activityObjectHtml = <>
          a <a href={activityObject.id ?? '#'}>
            {activityObject.type.toLowerCase()}
          </a>
          {'target' in thing && thing.target ? <>
            {' '}
            to
            {' '}
            <a href={(typeof thing.target === 'string' ? thing.target : 'id' in thing.target ? thing.target.id : '') ?? ''}>
              {(typeof thing.target === 'string' ? thing.target : 'name' in thing.target ? thing.target.name : '') ?? ''}
            </a>
          </> : <></>}
      </>
      }
    } else if (typeof activityObject === 'string') {
      activityObjectHtml = <>
        <a href={activityObject}>
          {activityObject}
        </a>
      </>
    }

    return <li className="card" key={thing.id}>
      <p>
        {activityActorHtml}
        {' '}
        {activityTypeHtml}
        {' '}
        {activityObjectHtml}.
      </p>
      
      {activityObject && 'summary' in activityObject && activityObject.summary ? <>
        <blockquote>
          {activityObject.summary ?? activityObject.content}
        </blockquote>
      </> : activityObject && 'preferredUsername' in activityObject && activityObject.preferredUsername ? <>
        <blockquote>
          @{activityObject.preferredUsername}
        </blockquote>
      </> : <></>}

      {activityObject && activityObject.type !== AP.ObjectTypes.TOMBSTONE ? <>
        <dl>
          <dt>Likes</dt>
          <dd>
            {'likes' in activityObject && activityObject.likes && typeof activityObject.likes === 'object' && 'totalItems' in activityObject.likes ? activityObject.likes.totalItems : 'unknown'}
          </dd>

          <dt>Shares</dt>
          <dd>{'shares' in activityObject && activityObject.shares && typeof activityObject.shares === 'object' && 'totalItems' in activityObject.shares ? activityObject.shares.totalItems : 'unknown'}</dd>
        </dl>

        <div className="form-buttons">
          <a className="a-button primary" href={activityObject.id ?? '#'}>
            Read More
          </a>
          <form
            onSubmit={handleOutboxSubmit(AP.ActivityTypes.LIKE, actor)}
            noValidate>
            <input type="hidden" name="id" value={activityObject.id ?? ''} />
            <input type="hidden" name="to" value={typeof activityActor === 'string' ? activityActor : !Array.isArray(activityActor) ? activityActor.id ?? '' : '' ?? ''} />
            <button type="submit" className="action">
              Like
            </button>
          </form>

          <form
            onSubmit={handleOutboxSubmit(AP.ActivityTypes.ANNOUNCE, actor)}
            noValidate>
            <input type="hidden" name="id" value={activityObject.id ?? ''} />
            <input type="hidden" name="to" value={typeof activityActor === 'string' ? activityActor : !Array.isArray(activityActor) ? activityActor.id ?? '' : '' ?? ''} />
            <button type="submit" className="action">
              Share
            </button>
          </form>
          
          <form
            onSubmit={handleOutboxSubmit(thing.type === AP.ActivityTypes.ADD ? AP.ActivityTypes.REMOVE : AP.ActivityTypes.ADD, actor)}
            noValidate>
            <input type="hidden" name="id" value={activityObject.id ?? ''} />
            <input type="hidden" name="target" value={Array.isArray(streams) ? [...streams].map((stream: AP.CollectionReference) => typeof stream === 'object' && !Array.isArray(stream) && stream.name === 'Bookmarks' ? stream.id : '').join('') : ''} />
            <button type="submit" className="action">
              {thing.type === AP.ActivityTypes.ADD ? 'Remove ' : ''}
              Bookmark
            </button>
          </form>

          {activityActor ? <>
            <form
              onSubmit={handleOutboxSubmit(AP.ActivityTypes.FOLLOW, actor)}
              noValidate>
              <input type="hidden" name="id" value={typeof activityActor === 'string' ? activityActor : 'id' in activityActor ? activityActor.id ?? '' : ''} />
              <input type="hidden" name="to" value={typeof activityActor === 'string' ? activityActor: 'id' in activityActor ? activityActor.id ?? '' : ''} />
              <button type="submit" className="action">
                Follow
              </button>
            </form>
          </> : <></>}

          <details>
            <summary className="secondary">
              Edit
            </summary>
            <form
              onSubmit={handleOutboxSubmit(AP.ActivityTypes.UPDATE, actor)}
              noValidate>
              <input type="hidden" name="id" value={activityObject.id ?? ''} />
              <label>
                <span>Summary</span>
                <textarea name="summary" defaultValue={'summary' in activityObject ? activityObject.summary : ''}></textarea>
              </label>
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
          
          <details>
            <summary className="secondary">
              Details
            </summary>
            <figure>
              <textarea defaultValue={JSON.stringify(thing)}></textarea>
              <h2>Activity Details</h2>
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
              </dl>
              <h2>Object Details</h2>
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
            </figure>
          </details>

          <form
            onSubmit={handleOutboxSubmit(AP.ActivityTypes.DELETE, actor)}
            noValidate>
            <input type="hidden" name="id" value={activityObject.id ?? ''} />
            <input type="hidden" name="to" value={typeof activityActor === 'string' ? activityActor : !Array.isArray(activityActor) ? activityActor.id ?? '' : '' ?? ''} />
            <button type="submit" className="danger">
              Delete
            </button>
          </form>
        </div>
      </> : <>
        <blockquote>
          {'<'}Deleted{'>'}
        </blockquote>
      </>}
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
  streams = [],
}: Data) {

  const [filter, setFilter]: [filter: string, setFilter: Function] = useState(AP.ActivityTypes.CREATE);

  if (!actor) {
    return <Home />;
  }

  const getBoxHtml = (item: AP.AnyThing) => getBoxItemHtml(item, actor, streams, filter);

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
