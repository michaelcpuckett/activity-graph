import { Graph } from ".";
import { getCollectionNameByUrl } from "../utilities/getCollectionNameByUrl";

export async function insertOrderedItem(this: Graph, path: string, url: string) {
  const collectionName = getCollectionNameByUrl(path);
  await this.db.collection(collectionName).updateOne(
    {
      _id: path,
    },
    {
      $inc: {
        totalItems: 1,
      },
      $push: {
        orderedItems: {
          $each: [url],
          $position: 0,
        },
      },
    },
    {
      upsert: true,
    },
  );
}

export async function removeOrderedItem(this: Graph, path: string, url: string) {
  const collectionName = getCollectionNameByUrl(path);
  await this.db.collection(collectionName).updateOne(
    {
      _id: path,
    },
    {
      $inc: {
        totalItems: -1,
      },
      $pull: {
        orderedItems: url,
      },
    },
    {
      upsert: true,
    },
  );
}

export async function insertItem(this: Graph, path: string, url: string) {
  const collectionName = getCollectionNameByUrl(path);
  await this.db.collection(collectionName).updateOne(
    {
      _id: path,
    },
    {
      $inc: {
        totalItems: 1,
      },
      $push: {
        items: {
          $each: [url],
        },
      },
    },
    {
      upsert: true,
    },
  );
}

export async function removeItem(this: Graph, path: string, url: string) {
  const collectionName = getCollectionNameByUrl(path);
  await this.db.collection(collectionName).updateOne(
    {
      _id: path,
    },
    {
      $inc: {
        totalItems: -1,
      },
      $pull: {
        items: url,
      },
    },
    {
      upsert: true,
    },
  );
}
