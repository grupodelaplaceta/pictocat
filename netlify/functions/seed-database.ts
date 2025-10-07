// netlify/functions/seed-database.ts
import { Handler } from '@netlify/functions';
import sql from './db';
import { MASTER_IMAGE_CATALOG_DATA } from './_shared/catalog-data';

export const handler: Handler = async () => {
  try {
    const allCatsFromSource = Object.entries(MASTER_IMAGE_CATALOG_DATA)
      .flatMap(([_, images]) =>
        images.map(image => ({
          theme: image.theme,
          url: image.url,
          original_id: image.id
        }))
      );

    // Fetch IDs of cats already in the database to prevent errors
    const existingCatsResult = await sql`SELECT original_id FROM cats`;
    const existingIds = new Set(existingCatsResult.map((row: { original_id: string }) => row.original_id));

    const catsToInsert = allCatsFromSource.filter(cat => !existingIds.has(cat.original_id));

    if (catsToInsert.length === 0) {
      const result = await sql`SELECT COUNT(*) FROM cats`;
      const count = result[0].count;
      return { 
        statusCode: 200, 
        body: JSON.stringify({
          success: true,
          message: 'Database is already up to date.',
          totalCatsInDB: count
        })
      };
    }
    
    // Use a transaction to insert the new cats safely
    await sql`BEGIN`;
    try {
        for (const cat of catsToInsert) {
            await sql`
                INSERT INTO cats (theme, url, original_id)
                VALUES (${cat.theme}, ${cat.url}, ${cat.original_id})
            `;
        }
        await sql`COMMIT`;
    } catch (e) {
        await sql`ROLLBACK`;
        throw e; // Rethrow to be caught by the outer block
    }

    const result = await sql`SELECT COUNT(*) FROM cats`;
    const count = result[0].count;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
          success: true, 
          message: `Successfully inserted ${catsToInsert.length} new cats.`,
          totalCatsInDB: count 
      }),
    };
  } catch (error) {
    console.error('Database seeding error:', error);
    return { statusCode: 500, body: `Internal Server Error: ${error.message}` };
  }
};