import type { NextApiRequest, NextApiResponse } from 'next';
import * as AP from 'activitypub-core/types';
import { GetEntityEndpoint } from 'activitypub-core/endpoints/get/entity';
import { EntityPage } from '../../../components/EntityPage';
import { LOCAL_DOMAIN } from 'activitypub-core/globals';
import inboxHandler from '../[username]/inbox';
import outboxHandler from '../[username]/outbox';

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<string | AP.AnyThing | {
    error?: string;
  }>
) {
  const url = new URL(`${LOCAL_DOMAIN}/${request.url}`).pathname.split('/');
  const lastPart = url[url.length - 1];

  if (request.method === 'POST') {
    if (lastPart === 'inbox') {
      return await inboxHandler(request, response);
    }

    if (lastPart === 'outbox') {
      return await outboxHandler(request, response);
    }

    return response.status(400).json({
      error: 'Bad request.',
    });
  }

  try {
    const endpoint = new GetEntityEndpoint(request, response);
    const entity = await endpoint.getEntity();
    return endpoint.respond(
      <EntityPage entity={entity}></EntityPage>
    );
  } catch (error) {
    return response.status(400).json({
      error: String(error)
    });
  }
}