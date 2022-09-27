import { PUBLIC_ACTOR } from 'activitypub-core/src/globals';
import * as AP from 'activitypub-core/src/types';

export function CreateForm({ actor, streams, handleOutboxSubmit }: { actor: AP.AnyActor, streams?: AP.AnyCollection[], handleOutboxSubmit: Function }) {
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
                        <label key={group.id ?? ''}>
                           <span>
                              {(typeof group !== 'string' ? ('name' in group ? group.name : group.id) : '') ?? ''}
                           </span>
                           <input defaultChecked={true} type="checkbox" name="to" value={membersCollection.id ?? ''} />
                        </label>
                     )
                  })
               }
            })}
         </fieldset>
         <button type="submit">
            Submit
         </button>
      </form>
   </>;
};
