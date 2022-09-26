import '@testing-library/jest-dom';
import { APCollection } from 'activitypub-core/classes/activity_pub';

describe('Types', () => {
  describe('can handle an Activity Object', () => {
    it('when valid', () => {
      const collection = new APCollection({
        type: 'Collection',
      });

      expect(collection).toBeTruthy();
    });

    it('can get the collection name', () => {
      const collection = new APCollection({
        type: 'Collection',
      });

      const collectionName = collection.getCollectionType();

      expect(collectionName).toBe('collection');
    });

    it('when given a bad type', () => {
      const createCollection = () =>
        new APCollection({
          type: 'Create',
        });

      expect(createCollection).toThrow();
    });
  });
});
