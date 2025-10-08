// netlify/functions/get-catalog.ts
import { Handler } from '@netlify/functions';
import getDb from './db';
import { CatImage } from '../../types';

export const handler: Handler = async () => {
  try {
    const db = await getDb();
    const catsCollection = db.collection('cats');

    const catsFromDb = await catsCollection.find({}).toArray();

    const catCatalog: CatImage[] = catsFromDb.map((cat, index) => ({
      id: index + 1, // Using index as a temporary numeric ID for frontend compatibility
      url: cat.url,
      theme: cat.theme
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(catCatalog),
    };
  } catch (error) {
    console.error('Get catalog error:', error);
    return { statusCode: 500, body: 'Internal Server Error' };
  }
};
