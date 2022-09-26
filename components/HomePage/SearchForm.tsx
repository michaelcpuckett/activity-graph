import * as AP from '../../lib/types/activity_pub';

export function SearchForm({ actor, handleOutboxSubmit }: { actor: AP.Actor, handleOutboxSubmit: Function }) {
  return <>
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
  </>
}