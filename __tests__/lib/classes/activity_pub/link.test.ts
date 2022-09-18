import '@testing-library/jest-dom';
import {
  APLink,
} from '../../../../lib/classes/activity_pub';

describe('Types', () => {
  describe('can handle an Activity Object', () => {
    it('when valid', () => {
      const object = new APLink({
        type: 'Link',
      });

      const [, collectionName] = new URL(object.id ?? '').pathname.split('/');

      expect(object).toBeTruthy();
      expect(collectionName).toBe('link');
    });

    it('when given a bad type', () => {
      const createObject = () => new APLink({
        type: 'Create',
      });

      expect(createObject).toThrow();
    });
  });
});