import type { NextApiRequest, NextApiResponse } from 'next';
import { Graph } from '../../../lib/graph';
import { CONTEXT, LOCAL_DOMAIN } from '../../../lib/globals';
import * as AP from '../../../lib/types/activity_pub';
import { getTypedThing } from '../../../lib/utilities/getTypedThing';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AP.AnyThing & {
    [CONTEXT]: string|string[];
  } | {
    error?: string;
  }>
) {
  const url = `${LOCAL_DOMAIN}${req.url}`;

  console.log(url);

  if (typeof url !== 'string') {
    return res.status(400).json({
      error: 'Could not locate thing.',
    });
  }

  const graph = await Graph.connect();
  const thing = await graph.findThingById(url);

  if (!thing) {
    return res.status(400).json({
      error: 'Could not locate thing.',
    });
  }

  const typedThing = getTypedThing(thing);

  if (!typedThing) {
    return res.status(400).json({
      error: 'Could not locate thing.',
    });
  }

  return res.status(200).json(typedThing.formatPublicObject());
}