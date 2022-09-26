import * as AP from 'activitypub-core/types/activity_pub';
import { NoteEntity } from './Note';

export function ObjectEntity({ object }: { object: AP.Object }) {
  if (object.type === AP.ObjectTypes.NOTE) {
    return <NoteEntity note={object}></NoteEntity>;
  }

  return <div className="card">
    <h1>
      <>
        A {object.type}
      </>
    </h1>
  </div>;
}