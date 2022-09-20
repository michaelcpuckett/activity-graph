export const getCollectionNameByUrl = (url: string) => {
    const [ , collectionName, identifier, nextIdentifier, finalIdentifier ] = new URL(url).pathname.split('/');
  
    return (!finalIdentifier && nextIdentifier) ? 'collection' : collectionName;
  }