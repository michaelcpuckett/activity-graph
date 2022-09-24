import { PUBLIC_ACTOR } from '../lib/globals';
import * as AP from '../lib/types/activity_pub';

export function ThingCard({ thing, streams, filter, actor, handleOutboxSubmit }: { thing: string|AP.AnyThing, filter?: string; actor: AP.AnyActor; handleOutboxSubmit?: Function; streams: AP.Collection[]; }) {
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

  return <li className="card">
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

          {handleOutboxSubmit ? <>
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
            
            {streams ? <>
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
            </> : <></>}


            {handleOutboxSubmit && actor && actor.id === (typeof activityActor === 'string' ? activityActor : 'id' in activityActor ? activityActor.id : '')  ? <>

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
          </> : <></>}
            </> : <></>}
          
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

          {handleOutboxSubmit && actor && actor.id === (typeof activityActor === 'string' ? activityActor : 'id' in activityActor ? activityActor.id : '')  ? <>
            <form
              onSubmit={handleOutboxSubmit(AP.ActivityTypes.DELETE, actor)}
              noValidate>
              <input type="hidden" name="id" value={activityObject.id ?? ''} />
              <input type="hidden" name="to" value={typeof activityActor === 'string' ? activityActor : !Array.isArray(activityActor) ? activityActor.id ?? '' : '' ?? ''} />
              <button type="submit" className="danger">
                Delete
              </button>
            </form>
          </> : <></>}
        </div>
      </> : <>
        <blockquote>
          {'<'}Deleted{'>'}
        </blockquote>
      </>}
    </li>
  }
  return <></>;
}