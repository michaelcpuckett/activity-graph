import '@testing-library/jest-dom';
import {
  APActor,
} from '../../../../lib/classes/activity_pub';

describe('Types', () => {
  describe('can handle an Actor Object', () => {
    it('when valid', () => {
      const object = new APActor({
        type: 'Person',
        inbox: 'http://un.org',
        outbox: 'http://un.org',
      });

      expect(object).toBeTruthy();
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