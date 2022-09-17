import '@testing-library/jest-dom'
import * as AS from '../../../../lib/types/activity_streams';

describe('Types', () => {
  it('can handle a Note Object', () => {
    const object: AS.Object = {
      type: AS.ObjectTypes.NOTE,
    };

    expect(object.type).toBe('Note');
  });
  
  it('can handle a Tombstone Object', () => {
    const object: AS.Tombstone = {
      type: AS.ObjectTypes.TOMBSTONE,
      deleted: new Date(),
      formerType: AS.ObjectTypes.NOTE,
    };

    expect(object.type).toBe('Tombstone');
  });

  it('can handle an Actor', () => {
    const object: AS.Actor = {
      type: AS.ActorTypes.PERSON,
    };

    expect(object.type).toBe('Person');
  });
});