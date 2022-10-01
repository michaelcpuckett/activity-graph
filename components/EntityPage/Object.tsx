import { AP } from 'activitypub-core/src/types';
import { NoteEntity } from './Note';

export function ObjectEntity({ object }: { object: AP.ExtendedObject }) {
  if (object.type === AP.ExtendedObjectTypes.NOTE) {
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