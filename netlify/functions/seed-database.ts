// netlify/functions/seed-database.ts
import { Handler } from '@netlify/functions';
import sql from './db';
import { MASTER_IMAGE_CATALOG_DATA } from './_shared/catalog-data';

export const handler: Handler = async () => {
  try {
    const catsToInsert = Object.entries(MASTER_IMAGE_CATALOG_DATA)
      .flatMap(([_, images]) =>
        images.map(image => ({
          theme: image.theme,
          url: image.url,
          original_id: image.id
        }))
      );

    if (catsToInsert.length === 0) {
      return { statusCode: 200, body: 'No new cats to insert.' };
    }
    
    // Use a transaction to insert cats one by one.
    // This is more robust than a single large bulk insert and avoids potential query size issues.
    await sql.begin(async (tx) => {
        for (const cat of catsToInsert) {
            await tx`
                INSERT INTO cats (theme, url, original_id)
                VALUES (${cat.theme}, ${cat.url}, ${cat.original_id})
                ON CONFLICT (original_id) DO NOTHING
            `;
        }
    });

    const result = await sql`SELECT COUNT(*) FROM cats`;
    const count = result[0].count;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
          success: true, 
          message: 'Database seeded successfully!',
          totalCatsInDB: count 
      }),
    };
  } catch (error) {
    console.error('Database seeding error:', error);
    return { statusCode: 500, body: `Internal Server Error: ${error.message}` };
  }
};
