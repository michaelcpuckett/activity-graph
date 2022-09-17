import '@testing-library/jest-dom';
import * as AP from '../../../../lib/types/activity_pub';

describe('Types', () => {
  describe('can handle a Note Object', () => {
    it('when valid', () => {
      const object: AP.Object = {
        type: AP.ObjectTypes.NOTE,
      };

      expect(object.type).toBe('Note');
    });
  });
  
  describe('can handle a Tombstone Object', () => {
    it('when valid', () => {
        const object: AP.Tombstone = {
        type: AP.ObjectTypes.TOMBSTONE,
        deleted: new Date(),
        formerType: AP.ObjectTypes.NOTE,
      };

      expect(object.type).toBe('Tombstone');
    });
  });

  describe('can handle an Actor', () => {
    it('is readable when valid', () => {
      const object: AP.Actor = {
        type: AP.ActorTypes.PERSON,
        inbox: 'http://un.org',
        outbox: 'http://un.org',
      };

      expect(object.type).toBe('Person');
    });

    it('is not readable without `inbox` property', () => {
      const object: AP.Actor = {
        type: AP.ActorTypes.PERSON,
      } as AP.Actor;

      expect(object.type).toBe('Person');
    });
  });
});