import '@testing-library/jest-dom';
import {
  APObject,
} from '../../../../lib/classes/activity_pub';
import {
  ObjectTypes,
  ActivityTypes,
} from '../../../../lib/types/activity_pub';

describe('Types', () => {
  describe('can handle a Note Object', () => {
    it('when valid', () => {
      const object = new APObject({
        type: ObjectTypes.NOTE,
      });

      expect(object).toBeTruthy();
    });

    it('when given an invalid type', () => {
      const createObject = () => new APObject({
        type: ActivityTypes.CREATE,
      });

      expect(createObject).toThrow();
    });
  });
  
  describe('can handle a Tombstone Object', () => {
    it('when valid', () => {
      const createObject = () => new APObject({
        type: ObjectTypes.TOMBSTONE,
        deleted: new Date(),
        formerType: ObjectTypes.NOTE,
      });

      expect(createObject).toBeTruthy();
    });

    it('when given an invalid type', () => {
      const createObject = () => new APObject({
        type: ObjectTypes.DOCUMENT,
        deleted: new Date(),
        formerType: ObjectTypes.NOTE,
      });

      expect(createObject).toThrow();
    });
  });

  describe('can handle a Relationship Object', () => {
    it('when valid', () => {
      const createObject = () => new APObject({
        type: ObjectTypes.RELATIONSHIP,
        subject: 'http://un.org',
        object: 'http://un.org',
        relationship: 'http://un.org',
      });

      expect(createObject).toBeTruthy();
    });

    it('when given an invalid type', () => {
      const createObject = () => new APObject({
        type: ObjectTypes.NOTE,
        subject: 'http://un.org',
        object: 'http://un.org',
        relationship: 'http://un.org',
      });

      expect(createObject).toThrow();
    });
  });

  describe('can handle a Place Object', () => {
    it('when valid', () => {
      const createObject = () => new APObject({
        type: ObjectTypes.PLACE,
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
      const createObject = () => new APObject({
        type: ObjectTypes.NOTE,
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