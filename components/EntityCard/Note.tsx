import { AP } from 'activitypub-core/src/types';
import { EntityLink } from '../EntityLink';
import { EntityMeta } from '../EntityMeta';

export function NoteCard({ note }: { note: AP.Note }) {
  const {
    summary,
    content,
    location,
    attributedTo,
  } = note;

  return (
    <div>
      <h2>
        <EntityLink entity={note}>
          A Note
        </EntityLink>
      </h2>
      <dl>
        <dt>
          Sumamry
        </dt>
        <dd>
          {note.summary ?? ''}
        </dd>
        <dt>
          Content
        </dt>
        <dd>
          {note.content ?? ''}
        </dd>
        <dt>
          Location
        </dt>
        <dd>
          {note.location && !(note.location instanceof URL) && 'name' in note.location ? note.location.name ?? '' : ''}
        </dd>
        <EntityMeta entity={note.attributedTo as AP.Entity}>
          Attributed To
        </EntityMeta>
      </dl>
    </div>
  );
}



