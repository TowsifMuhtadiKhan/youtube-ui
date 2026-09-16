import { MongoClient } from "mongodb";

let client: MongoClient | null = null;

const getMongoUri = (): string => process.env.MONGODB_URI || "";

const getDbName = (): string => process.env.MONGODB_DB_NAME || "tomtube";

export const hasMongo = (): boolean => !!getMongoUri();

const getClient = async (): Promise<MongoClient> => {
  if (!client) {
    client = new MongoClient(getMongoUri());
    await client.connect();
  }
  return client;
};

const stateCollection = async () => {
  const c = await getClient();
  return c.db(getDbName()).collection<{ _id: string; value: unknown; updatedAt: string }>("app_state");
};

export const mongoGetState = async <T>(key: string): Promise<T | null> => {
  const col = await stateCollection();
  const doc = await col.findOne({ _id: key });
  return (doc?.value as T) || null;
};

export const mongoSetState = async <T>(key: string, value: T): Promise<void> => {
  const col = await stateCollection();
  await col.updateOne(
    { _id: key },
    {
      $set: {
        value,
        updatedAt: new Date().toISOString(),
      },
    },
    { upsert: true },
  );
};

export const mongoListStateByPrefix = async <T>(prefix: string): Promise<Array<{ key: string; value: T }>> => {
  const col = await stateCollection();
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const docs = await col
    .find({ _id: { $regex: `^${escaped}` } })
    .toArray();

  return docs.map((doc) => ({ key: doc._id, value: doc.value as T }));
};
