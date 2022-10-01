import Head from 'next/head'
import { ChangeEvent, ChangeEventHandler, FormEventHandler, MouseEventHandler, ReactElement, useState } from 'react';
import { AP } from 'activitypub-core/src/types';
import { Nav } from '../Nav';
import { Header } from '../Header';
import { Welcome } from './Welcome';
import { Box } from './Box';
import { CreateForm } from './CreateForm';
import { SearchForm } from './SearchForm';
import { ACCEPT_HEADER, ACTIVITYSTREAMS_CONTENT_TYPE } from 'activitypub-core/src/globals';

type Data = {
  actor: AP.Actor;
  inboxItems: AP.Entity[];
  outboxItems: AP.Entity[];
  streams?: AP.Collection[];
  following?: AP.Actor[];
  followers?: AP.Actor[];
  groups?: AP.Collection;
}

const handleOutboxSubmit = (activityType: typeof AP.ActivityTypes[keyof typeof AP.ActivityTypes], actor: AP.Actor): FormEventHandler<HTMLFormElement> => event => {
  event.preventDefault();
  const formElement = event.currentTarget;
  const { elements } = formElement;

  if (!(formElement instanceof HTMLFormElement)) {
    return;
  }

  let formElements: Array<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> = [];

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

  const activity: AP.TransitiveActivity = {
    type: activityType,
    actor: actor.id,
    ...body.target ? {
      target: body.target
    } : null,
    object: (
      AP.ActivityTypes.LIKE === activityType ||
      AP.ActivityTypes.ANNOUNCE === activityType ||
      AP.ActivityTypes.DELETE === activityType ||
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

  fetch(`${actor.outbox instanceof URL ? actor.outbox.toString() : actor.outbox.id?.toString()}`, {
    method: 'POST',
    body: JSON.stringify(activity),
    headers: {
      [ACCEPT_HEADER]: ACTIVITYSTREAMS_CONTENT_TYPE,
    },
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

export function HomePage({
  actor,
  inboxItems,
  outboxItems,
  streams = [],
  following = [],
  followers = [],
}: Data) {
  const [filter, setFilter]: [filter: string, setFilter: Function] = useState(AP.ActivityTypes.CREATE);

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
        <Header />

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
              <Welcome actor={actor} />
              <Nav actor={actor} streams={streams} />
            </div>
          </div>

          <div className="tabpanel" id="create">
            <div className="card">
              <CreateForm actor={actor} streams={streams} handleOutboxSubmit={handleOutboxSubmit} />
            </div>
          </div>

          <div className="tabpanel" id="inbox">
            <div className="card">
              <Box items={inboxItems} filter={filter} handleFilterChange={handleFilterChange} actor={actor} handleOutboxSubmit={handleOutboxSubmit}>
                <h2>Inbox</h2>
              </Box>
            </div>
          </div>

          <div className="tabpanel" id="outbox">
            <div className="card">
              <Box items={outboxItems} filter={filter} handleFilterChange={handleFilterChange} actor={actor} handleOutboxSubmit={handleOutboxSubmit}>
                <h2>Outbox</h2>
              </Box>
            </div>
          </div>

          <div className="tabpanel" id="search">
            <div className="card">
              <SearchForm actor={actor} handleOutboxSubmit={handleOutboxSubmit} />
            </div>
          </div>

        </div>
      </main>
    </>
  )
}