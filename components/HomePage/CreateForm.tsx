import { PUBLIC_ACTOR } from 'activitypub-core/src/globals';
import { AP } from 'activitypub-core/src/types';

export function CreateForm({ actor, streams, handleOutboxSubmit }: { actor: AP.Actor, streams?: AP.EitherCollection[], handleOutboxSubmit: Function }) {
  return <>
    <h2>Create</h2>
    <form
      onSubmit={handleOutboxSubmit(AP.ActivityTypes.CREATE, actor)}
      noValidate>
      <label>
        <span>
          Type
        </span>
        <select name="type" defaultValue={'Note'}>
          {Object.values(AP.ExtendedObjectTypes).map(type =>
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
          <input defaultChecked={true} type="checkbox" name="to" value={actor.followers ? actor.followers instanceof URL ? actor.followers.toString() : actor.followers.id?.toString() ?? '' : ''} />
        </label>
      </fieldset>
      <button type="submit">
        Submit
      </button>
    </form>
  </>;
};