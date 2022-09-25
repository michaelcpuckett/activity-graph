import '@testing-library/jest-dom';
import { APObject } from '../../../../lib/classes/activity_pub';

describe('Types', () => {
  describe('can handle a Note Object', () => {
    it('when valid', () => {
      const object = new APObject({
        type: 'Note',
      });

      expect(object).toBeTruthy();
    });

    it('can get the collection name', () => {
      const object = new APObject({
        type: 'Note',
      });

      const collectionName = object.getCollectionType();

      expect(collectionName).toBe('object');
    });

    it('when given an invalid type', () => {
      const createObject = () =>
        new APObject({
          type: 'Create',
        });

      expect(createObject).toThrow();
    });
  });

  describe('can handle a Tombstone Object', () => {
    it('when valid', () => {
      const createObject = () =>
        new APObject({
          type: 'Tombstone',
          deleted: new Date(),
          formerType: 'Note',
        });

      expect(createObject).toBeTruthy();
    });

    it('when given an invalid type', () => {
      const createObject = () =>
        new APObject({
          type: 'Document',
          deleted: new Date(),
        });

      expect(createObject).toThrow();
    });
  });

  describe('can handle a Relationship Object', () => {
    it('when valid', () => {
      const createObject = () =>
        new APObject({
          type: 'Relationship',
          subject: 'http://un.org',
          object: 'http://un.org',
          relationship: 'http://un.org',
        });

      expect(createObject).toBeTruthy();
    });

    it('when given an invalid type', () => {
      const createObject = () =>
        new APObject({
          type: 'Note',
          subject: 'http://un.org',
          object: 'http://un.org',
          relationship: 'http://un.org',
        });

      expect(createObject).toThrow();
    });
  });

  describe('can handle a Place Object', () => {
    it('when valid', () => {
      const createObject = () =>
        new APObject({
          type: 'Place',
          accuracy: 50,
          altitude: 50,
          longitude: 50,
          latitude: 50,
          radius: 50,
          units: 'cm',
        });

      expect(createObject).toBeTruthy();
    });

    it('when given an invalid type', () => {
      const createObject = () =>
        new APObject({
          type: 'Note',
          accuracy: 50,
          altitude: 50,
          longitude: 50,
          latitude: 50,
          radius: 50,
          units: 'cm',
        });

      expect(createObject).toThrow();
    });
  });
});
