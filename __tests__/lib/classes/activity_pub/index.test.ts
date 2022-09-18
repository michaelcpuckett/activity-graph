import '@testing-library/jest-dom';
import * as AP from '../../../../lib/classes/activity_pub';

describe('Types', () => {
  describe('can handle a Note Object', () => {
    it('when valid', () => {
      const object = new AP.Object({
        type: AP.ObjectTypes.NOTE,
      });

      expect(object instanceof AP.Object).toBe(true);
    });

    it('when given an invalid type', () => {
      const object = new AP.Object({
        type: AP.ActivityTypes.CREATE,
      });

      expect(object instanceof AP.Object).toBe(false);
    });
  });
  
  describe('can handle a Tombstone Object', () => {
    it('when valid', () => {
        const object = new AP.Object({
        type: AP.ObjectTypes.DOCUMENT,
        deleted: new Date(),
        formerType: AP.ObjectTypes.NOTE,
      });

      expect(object instanceof AP.Object).toBe(false);
    });

    it('when given an invalid type', () => {
      const object = new AP.Object({
      type: AP.ObjectTypes.TOMBSTONE,
      deleted: new Date(),
      formerType: AP.ObjectTypes.NOTE,
    });

    expect(object instanceof AP.Object).toBe(true);
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