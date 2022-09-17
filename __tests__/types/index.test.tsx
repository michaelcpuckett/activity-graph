import '@testing-library/jest-dom'
import * as AS from '../../types/activity_streams';

describe('Home', () => {
  it('can create a Note Object', () => {
    const object: AS.Object = {
      type: AS.ObjectTypes.NOTE,
    };

    expect(object.type).toBe('Note');
  });
  
  it('can create a Tombstone Object', () => {
    const object: AS.Tombstone = {
      type: AS.ObjectTypes.TOMBSTONE,
    };

    expect(object.type).toBe('Tombstone');
  });
});