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
});