import '@testing-library/jest-dom';
import {
  APActor,
} from '../../../../lib/classes/activity_pub';

describe('Types', () => {
  describe('can handle an Actor Object', () => {
    it('when valid', () => {
      const object = new APActor({
        type: 'Person',
        preferredUsername: 'foobar',
        inbox: 'http://un.org',
        outbox: 'http://un.org',
      });

      const [, collectionName, collectionId] = new URL(object.id ?? '').pathname.split('/');

      expect(object).toBeTruthy();
      expect(collectionName).toBe('actor');
      expect(collectionId).toBe('foobar');
    });

    it('creates a random ID when not given a preferredUsername', () => {
      const object = new APActor({
        type: 'Person',
        inbox: 'http://un.org',
        outbox: 'http://un.org',
      });

      const [, collectionName] = new URL(object.id ?? '').pathname.split('/');

      expect(collectionName).toBe('actor');
    });

    it('when not given an inbox', () => {
      const createObject = () => new APActor({
        type: 'Person',
        outbox: 'http://un.org',
      });

      expect(createObject).toThrow();
    });

    it('when not given an outbox', () => {
      const createObject = () => new APActor({
        type: 'Person',
        inbox: 'http://un.org',
      });

      expect(createObject).toThrow();
    });
  });
});