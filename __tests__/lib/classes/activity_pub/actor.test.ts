import '@testing-library/jest-dom';
import { APActor } from '../../../../lib/classes/activity_pub';

describe('Types', () => {
  describe('can handle an Actor Object', () => {
    it('when valid', () => {
      const actor = new APActor({
        type: 'Person',
        preferredUsername: 'foobar',
        inbox: 'http://un.org',
        outbox: 'http://un.org',
      });

      expect(actor).toBeTruthy();
    });

    it('can get the collection name', () => {
      const actor = new APActor({
        type: 'Person',
        preferredUsername: 'foobar',
        inbox: 'http://un.org',
        outbox: 'http://un.org',
      });

      const collectionName = actor.getCollectionType();

      expect(collectionName).toBe('actor');
    });

    it('when not given an inbox', () => {
      const createActor = () =>
        new APActor({
          type: 'Person',
          outbox: 'http://un.org',
        });

      expect(createActor).toThrow();
    });

    it('when not given an outbox', () => {
      const createActor = () =>
        new APActor({
          type: 'Person',
          inbox: 'http://un.org',
        });

      expect(createActor).toThrow();
    });
  });
});
