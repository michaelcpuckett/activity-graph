import * as AP from '../../lib/types/activity_pub';
import { PUBLIC_ACTOR } from '../../lib/globals';
import { getCount } from '../../lib/utilities/getCount';
import { useEffect, useState } from 'react';

export function NoteEntity({ note }: { note: AP.Object }) {
  return <>
    <div className="card">
      <h1>
        {note.summary ?? 'A post'}
      </h1>
      <blockquote>
        {note.content}
      </blockquote>
      <dl>
        <>
          <dt>By</dt>
          <dd>
            TODO...
          </dd>

          <dt>To</dt>
          <dd>
            <>{note.to === PUBLIC_ACTOR ? 'Public' : note.to}</>
          </dd>

          <dt>Published</dt>
          <dd>
            {note.published ? new Date(note.published).toDateString() : ''}
          </dd>

          <dt>
            Updated
          </dt>
          <dd>
            {note.updated ? new Date(note.updated).toDateString() : ''}
          </dd>

          <dt>Location</dt>
          <dd>
            <>{note.location ?? ''}</>
          </dd>
          {/* Like & Share if logged in */}
        </>
      </dl>
    </div>
  </>
}