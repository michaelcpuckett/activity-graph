import { Graph } from ".";

export async function saveString(this: Graph, dbCollection: string, _id: string, value: string) {
  return await this.db.collection(dbCollection).replaceOne(
    {
      _id,
    },
    JSON.parse(
      JSON.stringify({
        value,
      }),
    ),
    {
      upsert: true,
    },
  );
}

