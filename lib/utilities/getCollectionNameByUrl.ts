import { LOCAL_HOSTNAME } from "../globals";

export const getCollectionNameByUrl = (url: string) => {
  const isLocal = new URL(url).hostname === LOCAL_HOSTNAME;

  if (!isLocal) {
    return 'foreign-object';
  }

  const [ , collectionName, identifier, nextIdentifier, finalIdentifier ] = new URL(url).pathname.split('/');
  
  return (!finalIdentifier && nextIdentifier) ? 'collection' : collectionName;
}