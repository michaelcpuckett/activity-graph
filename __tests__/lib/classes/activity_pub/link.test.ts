import '@testing-library/jest-dom';
import { APLink } from '../../../../lib/classes/activity_pub';

describe('Types', () => {
  describe('can handle a Link', () => {
    it('when valid', () => {
      const link = new APLink({
        type: 'Link',
      });

      expect(link).toBeTruthy();
    });

    it('can get the collection name', () => {
      const link = new APLink({
        type: 'Mention',
      });

      const collectionName = link.getCollectionType();

      expect(collectionName).toBe('link');
    });

    it('when given a bad type', () => {
      const createLink = () =>
        new APLink({
          type: 'Create',
        });

      expect(createLink).toThrow();
    });
  });
});
