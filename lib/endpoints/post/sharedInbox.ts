import type { NextApiRequest, NextApiResponse } from 'next';
import { CONTEXT } from '../../../lib/globals';
import * as AP from '../../../lib/types/activity_pub';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    | (AP.AnyThing & {
      [CONTEXT]: string | string[];
    })
    | {
      error?: string;
    }
  >,
) {
  return res.status(300).json({
    error: 'BAD REQUEST',
  });
}