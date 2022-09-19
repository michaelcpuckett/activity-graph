import '@testing-library/jest-dom';
import {
  APCollectionPage,
} from '../../../../lib/classes/activity_pub';

describe('Types', () => {
  describe('can handle a Collection Page', () => {
    it('when valid', () => {
      const collectionPage = new APCollectionPage({
        type: 'CollectionPage',
      });

      expect(collectionPage).toBeTruthy();
    });

    it('can get the collection name', () => {
      const collectionPage = new APCollectionPage({
        type: 'CollectionPage',
      });

      const collectionName = collectionPage.getCollectionType();

      expect(collectionName).toBe('collection-page');
    });

    it('when given a bad type', () => {
      const createCollectionPage = () => new APCollectionPage({
        type: 'Create',
      });

      expect(createCollectionPage).toThrow();
    });
  });
});