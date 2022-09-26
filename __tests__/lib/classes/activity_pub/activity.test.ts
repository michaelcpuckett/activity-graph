import '@testing-library/jest-dom';
import { APActivity } from 'activitypub-core/classes/activity_pub';

describe('Types', () => {
  describe('can handle an Activity Object', () => {
    it('when valid', () => {
      const activity = new APActivity({
        type: 'Create',
        actor: 'http://un.org',
      });

      expect(activity).toBeTruthy();
    });

    it('can get the collection name', () => {
      const activity = new APActivity({
        type: 'Create',
        actor: 'http://un.org',
      });

      const collectionName = activity.getCollectionType();

      expect(collectionName).toBe('activity');
    });

    it('when not given an actor', () => {
      const createActivity = () =>
        new APActivity({
          type: 'Create',
        });

      expect(createActivity).toThrow();
    });
  });
});
