import '@testing-library/jest-dom';
import {
  APActivity,
} from '../../../../lib/classes/activity_pub';

describe('Types', () => {
  describe('can handle an Activity Object', () => {
    it('when valid', () => {
      const object = new APActivity({
        type: 'Create',
        actor: 'http://un.org',
      });

      const [, collectionName] = new URL(object.id ?? '').pathname.split('/');

      expect(object).toBeTruthy();
      expect(collectionName).toBe('activity');
    });

    it('when not given an actor', () => {
      const createObject = () => new APActivity({
        type: 'Create',
      });

      expect(createObject).toThrow();
    });
  });
});