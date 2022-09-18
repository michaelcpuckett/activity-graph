import '@testing-library/jest-dom';
import {
  APCollection,
} from '../../../../lib/classes/activity_pub';

describe('Types', () => {
  describe('can handle an Activity Object', () => {
    it('when valid', () => {
      const object = new APCollection({
        type: 'Collection',
      });

      const [, collectionName] = new URL(object.id ?? '').pathname.split('/');

      expect(object).toBeTruthy();
      expect(collectionName).toBe('collection');
    });

    it('when given a bad type', () => {
      const createObject = () => new APCollection({
        type: 'Create',
      });

      expect(createObject).toThrow();
    });
  });
});