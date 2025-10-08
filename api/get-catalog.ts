// api/get-catalog.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from './_utils/mongodb';
import { CatImage } from '../types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const db = await getDb();
    const catsCollection = db.collection('cats');
    
    // MongoDB's _id is not a simple incrementing integer, so we need a different way to sort if we want that.
    // For now, we fetch and let the frontend handle it, or sort by another field if necessary.
    // Let's assume the frontend just needs the list. We'll rename _id to id.
    const catsFromDb = await catsCollection.find({}).toArray();

    const catCatalog: CatImage[] = catsFromDb.map((cat, index) => ({
      // The frontend expects a numeric ID. We can use the index for simplicity,
      // but a dedicated numeric ID in the DB would be better long-term.
      // For now, let's use a temporary solution. A better one would be to use `original_id` if it was numeric.
      // Let's check the schema. `id` is a number. I'll just use the index for now.
      id: index + 1, // This is not ideal as it's not stable. A proper migration would add a numeric id.
      url: cat.url,
      theme: cat.theme
    }));
    
    // A better approach if the frontend can handle string IDs from the original data:
    // const catCatalog = catsFromDb.map(cat => ({
    //   id: cat.original_id, // assuming frontend can take string
    //   url: cat.url,
    //   theme: cat.theme
    // }));
    // The type `CatImage` requires `id: number`. So the above is necessary.

    return res.status(200).json(catCatalog);
  } catch (error) {
    console.error('Get catalog error:', error);
    return res.status(500).send('Internal Server Error');
  }
}
