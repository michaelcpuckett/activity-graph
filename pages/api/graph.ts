import type { NextApiRequest, NextApiResponse } from 'next';
import { Graph } from 'activitypub-core/src/graph';
import { generateKeyPair, getGuid } from 'activitypub-core/src/crypto';
import { LOCAL_DOMAIN, SERVER_ACTOR_ID } from 'activitypub-core/src/globals';
import { AP } from 'activitypub-core/src/types';
import { PokemonClient } from 'pokenode-ts';

type Data = {
  error?: string;
  success?: boolean;
};


export default async function graphHandler (
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const api = new PokemonClient();

  await api
    .getPokemonByName('luxray')
    .then((data) => console.log(data)) // will output "Luxray"
    .catch((error) => console.error(error));
  
  res.status(200).send({ success: true });
}