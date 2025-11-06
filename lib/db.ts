import type { Collection, Db, Document } from 'mongodb';
import { MongoClient } from 'mongodb';

declare global {
  // eslint-disable-next-line no-var
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

const { MONGODB_URI, MONGODB_DB_NAME } = process.env;

if (!MONGODB_URI) {
  throw new Error('Missing MONGODB_URI environment variable. Please provide a valid MongoDB connection string.');
}

if (!MONGODB_DB_NAME) {
  throw new Error('Missing MONGODB_DB_NAME environment variable. Please provide the database name to use.');
}

const mongoClient = new MongoClient(MONGODB_URI, {
  maxPoolSize: 20,
});

const clientPromise =
  global.__mongoClientPromise ??
  mongoClient.connect().catch((error) => {
    console.error('Failed to connect to MongoDB', error);
    throw error;
  });

if (!global.__mongoClientPromise) {
  global.__mongoClientPromise = clientPromise;
}

export async function getMongoClient(): Promise<MongoClient> {
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(MONGODB_DB_NAME);
}

export async function getCollection<T extends Document = Document>(name: string): Promise<Collection<T>> {
  const db = await getDb();
  return db.collection<T>(name);
}
