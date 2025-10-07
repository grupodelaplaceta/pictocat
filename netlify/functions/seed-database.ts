// netlify/functions/seed-database.ts
import { Handler } from '@netlify/functions';
import sql from './db';
import { MASTER_IMAGE_CATALOG_DATA } from './_shared/catalog-data';

export const handler: Handler = async () => {
  try {
    const catsToInsert = Object.entries(MASTER_IMAGE_CATALOG_DATA)
      .flatMap(([phraseId, images]) =>
        images.map(image => ({
          theme: image.theme,
          url: image.url,
          original_id: image.id
        }))
      );

    if (catsToInsert.length === 0) {
      return { statusCode: 200, body: 'No new cats to insert.' };
    }
    
    // Corrected SQL for bulk insert using the postgres.js helper format.
    // The sql(...) helper generates the full "(columns) VALUES (rows...)" statement.
    await sql`
        INSERT INTO cats (theme, url, original_id) ${sql(catsToInsert, 'theme', 'url', 'original_id')}
        ON CONFLICT (original_id) DO NOTHING
    `;

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