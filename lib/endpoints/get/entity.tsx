import type { NextApiRequest, NextApiResponse } from 'next';
import { Graph } from '../../graph';
import { ACTIVITYSTREAMS_CONTENT_TYPE, CONTENT_TYPE_HEADER, JSON_CONTENT_TYPE, LINKED_DATA_CONTENT_TYPE, LOCAL_DOMAIN, PUBLIC_ACTOR } from '../../globals';
import * as AP from '../../types/activity_pub';
import { getTypedThing } from '../../utilities/getTypedThing';
import { renderToString } from 'react-dom/server';
import { ReactElement } from 'react';

export class GetEntityEndpoint {
  constructor(
    request: NextApiRequest,
    response: NextApiResponse<string | AP.AnyThing | {
      error?: string;
    }>
  ) {
    this.request = request;
    this.response = response;
  }

  public async getEntity(): Promise<AP.AnyThing> {
    const url = `${LOCAL_DOMAIN}${this.request.url}`;

    const graph = await Graph.connect();
    const thing = await graph.findThingById(url);

    if (!thing) {
      throw new Error('Could not locate thing.');
    }

    const typedThing = getTypedThing(thing);

    if (!typedThing) {
      throw new Error('Could not locate thing.');
    }

    const expandedThing = await graph.expandThing(typedThing.formatPublicObject());

    this.entity = expandedThing;

    if (!this.entity) {
      throw new Error('Could not locate thing.');
    }

    return this.entity;
  }

  private request: NextApiRequest;

  private response: NextApiResponse<string | AP.AnyThing | {
    error?: string;
  }>;

  public entity: AP.AnyThing | null = null;

  public async respond(html: ReactElement) {
    if (this.request.headers.accept?.includes(ACTIVITYSTREAMS_CONTENT_TYPE) || this.request.headers.accept?.includes(LINKED_DATA_CONTENT_TYPE) || this.request.headers.accept?.includes(JSON_CONTENT_TYPE)) {
      this.response.setHeader(CONTENT_TYPE_HEADER, ACTIVITYSTREAMS_CONTENT_TYPE);

      if (!this.entity) {
        return this.response.status(400).json({
          error: "Not found."
        });
      }

      return this.response.status(200).json(this.entity);
    }

    this.response.setHeader(CONTENT_TYPE_HEADER, 'text/html');

    return this.response.status(200).send(renderToString(html));
  }
}