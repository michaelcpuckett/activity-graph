import { ACTIVITYSTREAMS_CONTEXT } from 'activitypub-core/src/globals';
import { AP } from 'activitypub-core/src/types';
import { FormEvent, FormEventHandler } from 'react';

export function SearchForm({ actor }: { actor: AP.Actor }) {
  const handleOutboxSubmit: FormEventHandler<HTMLFormElement> = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query: { [key: string]: string | string[] } = {};

    for (const element of [...event.currentTarget.elements]) {
      if (element instanceof HTMLSelectElement) {
        query[element.name] = element.value;
      }

      if (element instanceof HTMLInputElement) {
        if (element.type.toLowerCase() === 'radio') {

        } else if (element.type.toLowerCase() === 'checkbox') {

        } else {
          query[element.name] = element.value;
        }
      }
    }

    for (const element of [...event.currentTarget.elements]) {
      if (element instanceof HTMLFieldSetElement) {
        for (const checkableElement of [...element.elements]) {
          if (checkableElement instanceof HTMLInputElement && checkableElement.type.toLowerCase() === 'radio') {
            if (checkableElement.checked) {
              query[checkableElement.name] = checkableElement.value;
            }
          } else if (checkableElement instanceof HTMLInputElement && checkableElement.type.toLowerCase() === 'checkbox') {
            if (checkableElement.checked) {
              query[checkableElement.name] = [...(query[checkableElement.name] ?? []), checkableElement.value];
            }
          }
        }
      }
    }

    const body = {
      "@context": ACTIVITYSTREAMS_CONTEXT,
      type: 'Follow',
      to: query.to,
      actor: query.actorId,
      object: query.to,
    };

    if (typeof query.actorOutboxId === 'string') {
      fetch(query.actorOutboxId, {
        method: 'POST',
        body: JSON.stringify(body),
      })
        .then(() => {
          console.log('Done');
          window.location.reload();
        })
    }
  };

  return <>
    <h2>Follow a User</h2>
    <form
      onSubmit={handleOutboxSubmit}
      noValidate>
      <input type="hidden" name="actorId" value={actor.id?.toString()} />
      <input type="hidden" name="actorOutboxId" value={actor.outbox?.id?.toString()} />
      <label>
        <span>What`s their ID?</span>
        <input name="to" />
      </label>
      <button type="submit">
        Follow
      </button>
    </form>
  </>
}