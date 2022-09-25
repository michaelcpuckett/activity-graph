import { Graph } from ".";
import * as AP from '../types/activity_pub';
import * as crypto from 'crypto';
import {
  CONTEXT,
  CONTENT_TYPE_HEADER,
  ACTIVITYSTREAMS_CONTENT_TYPE,
  ACCEPT_HEADER,
} from '../globals';

export async function signAndSendToForeignActorInbox(
  this: Graph,
  foreignActorInbox: string,
  actor: AP.Actor,
  activity: AP.AnyThing & {
    [CONTEXT]: AP.StringReference;
  },
) {
  if (!actor.preferredUsername) {
    return;
  }

  const userId = await this.findStringIdByValue(
    'username',
    actor.preferredUsername,
  );
  const privateKey = await this.findStringValueById('private-key', userId);

  if (!privateKey) {
    throw new Error("User's private key not found.");
  }

  const foreignDomain = new URL(foreignActorInbox).hostname;
  const foreignPathName = new URL(foreignActorInbox).pathname;

  // sign
  const digestHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(activity))
    .digest('base64');
  const signer = crypto.createSign('sha256');
  const dateString = new Date().toUTCString();
  const stringToSign = `(request-target): post ${foreignPathName}\nhost: ${foreignDomain}\ndate: ${dateString}\ndigest: SHA-256=${digestHash}`;
  signer.update(stringToSign);
  signer.end();
  const signature = signer.sign(privateKey);
  const signature_b64 = signature.toString('base64');
  const signatureHeader = `keyId="${actor.url}#main-key",algorithm="rsa-sha256",headers="(request-target) host date digest",signature="${signature_b64}"`;

  console.log('SENDING...');

  // send
  return await fetch(foreignActorInbox, {
    method: 'post',
    body: JSON.stringify(activity),
    headers: {
      [CONTENT_TYPE_HEADER]: ACTIVITYSTREAMS_CONTENT_TYPE,
      [ACCEPT_HEADER]: ACTIVITYSTREAMS_CONTENT_TYPE,
      Host: foreignDomain,
      Date: dateString,
      Digest: `SHA-256=${digestHash}`,
      Signature: signatureHeader,
    },
  });
}