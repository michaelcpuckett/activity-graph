import '@testing-library/jest-dom';
import { APThing } from '../../../../lib/classes/activity_pub/thing';
import { LOCAL_DOMAIN } from '../../../../lib/globals';

describe('Types', () => {
  describe('can compress a Thing', () => {
    it('when valid', () => {
      const thing = new APThing({
        id: `${LOCAL_DOMAIN}/actor/sparky`,
        url: `${LOCAL_DOMAIN}/actor/sparky`,
        type: 'Person',
        preferredUsername: 'sparky',
        inbox: {
          id: `${LOCAL_DOMAIN}/actor/sparky/inbox`,
          url: `${LOCAL_DOMAIN}/actor/sparky/inbox`,
          type: 'OrderedCollection',
        },
        outbox: {
          id: `${LOCAL_DOMAIN}/actor/sparky/outbox`,
          url: `${LOCAL_DOMAIN}/actor/sparky/outbox`,
          type: 'OrderedCollection',
        },
        streams: [
          {
            id: `${LOCAL_DOMAIN}/actor/sparky/blocked`,
            url: `${LOCAL_DOMAIN}/actor/sparky/blocked`,
            type: 'Collection',
          },
          {
            id: `${LOCAL_DOMAIN}/actor/sparky/groups`,
            url: `${LOCAL_DOMAIN}/actor/sparky/groups`,
            type: 'Collection',
          },
        ],
      });

      expect(JSON.parse(JSON.stringify(thing.compress()))).toStrictEqual(JSON.parse(JSON.stringify(({
        id: `${LOCAL_DOMAIN}/actor/sparky`,
        url: `${LOCAL_DOMAIN}/actor/sparky`,
        type: 'Person',
        preferredUsername: 'sparky',
        inbox: `${LOCAL_DOMAIN}/actor/sparky/inbox`,
        outbox: `${LOCAL_DOMAIN}/actor/sparky/outbox`,
        streams: [
          `${LOCAL_DOMAIN}/actor/sparky/blocked`,
          `${LOCAL_DOMAIN}/actor/sparky/groups`,
        ],
      }))));
    });
  });
  describe('can provide a Thing\'s compressed props', () => {
    it('when valid', () => {
      const thing = new APThing({
        id: `${LOCAL_DOMAIN}/activity/123`,
        url: `${LOCAL_DOMAIN}/activity/123`,
        type: 'Arrive',
        location: {
          id: `${LOCAL_DOMAIN}/object/123`,
          type: 'Place',
          name: 'Work'
        },
        origin: {
          id: `${LOCAL_DOMAIN}/object/456`,
          type: 'Place',
          name: 'Home',
          attributedTo: {
            id: `${LOCAL_DOMAIN}/actor/foobar`,
            url: `${LOCAL_DOMAIN}/actor/foobar`,
            type: 'Person',
            preferredUsername: 'sparky',
            inbox: {
              id: `${LOCAL_DOMAIN}/actor/foobar/inbox`,
              url: `${LOCAL_DOMAIN}/actor/foobar/inbox`,
              type: 'OrderedCollection',
            },
            outbox: {
              id: `${LOCAL_DOMAIN}/actor/foobar/outbox`,
              url: `${LOCAL_DOMAIN}/actor/foobar/outbox`,
              type: 'OrderedCollection',
            }
          }
        },
        actor: {
          id: `${LOCAL_DOMAIN}/actor/sparky`,
          url: `${LOCAL_DOMAIN}/actor/sparky`,
          type: 'Person',
          preferredUsername: 'sparky',
          inbox: {
            id: `${LOCAL_DOMAIN}/actor/sparky/inbox`,
            url: `${LOCAL_DOMAIN}/actor/sparky/inbox`,
            type: 'OrderedCollection',
          },
          outbox: {
            id: `${LOCAL_DOMAIN}/actor/sparky/outbox`,
            url: `${LOCAL_DOMAIN}/actor/sparky/outbox`,
            type: 'OrderedCollection',
          },
          streams: [
            {
              id: `${LOCAL_DOMAIN}/actor/sparky/blocked`,
              url: `${LOCAL_DOMAIN}/actor/sparky/blocked`,
              type: 'Collection',
            },
            {
              id: `${LOCAL_DOMAIN}/actor/sparky/groups`,
              url: `${LOCAL_DOMAIN}/actor/sparky/groups`,
              type: 'Collection',
            },
          ]
        }
      });

      const compressedProps = thing.getCompressedProps();

      expect(compressedProps.length).toBe(10);

      const compressedPropIds = compressedProps.map(({ id }) => id);

      expect(compressedPropIds).toContain(`${LOCAL_DOMAIN}/object/123`);
      expect(compressedPropIds).toContain(`${LOCAL_DOMAIN}/object/456`);
      expect(compressedPropIds).toContain(`${LOCAL_DOMAIN}/actor/sparky`);
      expect(compressedPropIds).toContain(`${LOCAL_DOMAIN}/actor/sparky/inbox`);
      expect(compressedPropIds).toContain(`${LOCAL_DOMAIN}/actor/sparky/outbox`);
      expect(compressedPropIds).toContain(`${LOCAL_DOMAIN}/actor/sparky/blocked`);
      expect(compressedPropIds).toContain(`${LOCAL_DOMAIN}/actor/sparky/groups`);
      expect(compressedPropIds).toContain(`${LOCAL_DOMAIN}/actor/foobar`);
      expect(compressedPropIds).toContain(`${LOCAL_DOMAIN}/actor/foobar/inbox`);
      expect(compressedPropIds).toContain(`${LOCAL_DOMAIN}/actor/foobar/outbox`);
    });
  });
});