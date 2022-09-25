import { PORT, LOCAL_HOSTNAME } from "../globals";

export const getCollectionNameByUrl = (url: string) => {
  const isLocal = new URL(url).hostname === LOCAL_HOSTNAME && new URL(url).port === PORT;

  if (!isLocal) {
    return 'foreign-object';
  }

  const [, collectionName] = new URL(url).pathname.split('/');
  
  return collectionName;
}