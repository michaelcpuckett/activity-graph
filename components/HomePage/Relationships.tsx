import * as AP from 'activitypub-core/types/activity_pub';

export function Relationships({ following, followers, streams, handleOutboxSubmit, actor }: { following: AP.Actor[], streams: AP.AnyCollection[], followers: AP.Actor[], handleOutboxSubmit: Function, actor: AP.Actor }) {
  return <>
    <h2>
      Following
    </h2>
    <ul>
      {following.map(item => (
        <li key={item.id}>
          <a href={item.id ?? ''}>
            @{item.preferredUsername}
          </a>
          <form
            onSubmit={handleOutboxSubmit(AP.ActivityTypes.ADD, actor)}
            noValidate>
            <input type="hidden" name="id" value={item.id ?? ''} />
            <select name="target">
              {streams?.map(stream => {
                if (stream.name === 'Groups' && 'items' in stream && Array.isArray(stream.items)) {
                  return stream.items.map(group => {
                    if (typeof group === 'string') {
                      return <></>;
                    }
                    const membersCollection = 'streams' in group && Array.isArray(group.streams) ? group.streams.find((groupStream: AP.AnyThing) => typeof groupStream !== 'string' && groupStream.name === 'Members') : null;
                    if (!membersCollection) {
                      return <></>;
                    }
                    return (
                      <option value={membersCollection.id ?? ''} key={group.id ?? ''}>
                        {(typeof group !== 'string' ? ('name' in group ? group.name : group.id) : '') ?? ''}
                      </option>
                    )
                  })
                }
              })}
            </select>
            <button type="submit">
              Add to Group
            </button>
          </form>
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
  </>
}