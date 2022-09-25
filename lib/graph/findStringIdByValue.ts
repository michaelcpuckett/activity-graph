import { Graph } from ".";

export async function findStringIdByValue(
  this: Graph,
  dbCollection: string,
  value: string,
): Promise<string> {
  const one = await this.db.collection(dbCollection).findOne({ value });

  if (!one) {
    return '';
  }

  if (!('_id' in one) || typeof one._id !== 'string') {
    return '';
  }

  return one._id;
}