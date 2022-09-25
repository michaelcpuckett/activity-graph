import { Graph } from ".";
import * as AP from '../types/activity_pub';
import {
  CONTEXT,
  PUBLIC_ACTOR,
} from '../globals';

export async function expandThing(this: Graph, thing: AP.AnyThing): Promise<AP.AnyThing> {
  const expanded = [];

  for (const [key, value] of Object.entries(thing)) {
    if (
      key === 'id' ||
      key === 'url' ||
      key === 'type' ||
      key === CONTEXT ||
      key === '_id' ||
      key === 'publicKey'
    ) {
      expanded.push([key, value]);
    } else if (typeof value === 'string') {
      if (value === PUBLIC_ACTOR) {
        expanded.push([key, value]);
      } else {
        try {
          const url = new URL(value);
          expanded.push([key, await this.queryById(url.toString())]);
        } catch (error) {
          expanded.push([key, value]);
        }
      }
    } else if (Array.isArray(value)) {
      const array = [...value];
      if (array.every((item: unknown) => typeof item === 'string')) {
        expanded.push([
          key,
          await Promise.all(
            array.map(async (item) => {
              if (typeof item === 'string') {
                if (item === PUBLIC_ACTOR) {
                  return item;
                }
                try {
                  const url = new URL(item);
                  return await this.queryById(url.toString());
                } catch (error) {
                  return item;
                }
              }
            }),
          ),
        ]);
      } else {
        expanded.push([key, value]);
      }
    } else {
      expanded.push([key, value]);
    }
  }

  return JSON.parse(JSON.stringify(Object.fromEntries(expanded)));
}