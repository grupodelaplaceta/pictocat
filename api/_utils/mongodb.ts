// api/_utils/mongodb.ts
import { MongoClient, Db } from 'mongodb';

const uri = process.env.PICTOCAT1_MONGODB_URI;
if (!uri) {
  throw new Error('Please define the PICTOCAT1_MONGODB_URI environment variable');
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getDb(): Promise<Db> {
  if (cachedClient && cachedDb) {
    return cachedDb;
  }

  const client = new MongoClient(uri);
  cachedClient = client;

  await client.connect();
  
  const db = client.db('pictocat1'); // Or specify your database name
  cachedDb = db;
  
  return db;
}
