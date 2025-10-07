// netlify/functions/seed-database.ts
import { Handler } from '@netlify/functions';
import sql from './db';
import { MASTER_IMAGE_CATALOG_DATA } from './_shared/catalog-data';

export const handler: Handler = async () => {
  try {
    // 1. Flatten the master catalog data into a simple array.
    const allCatsFromSource = Object.values(MASTER_IMAGE_CATALOG_DATA).flat();

    // 2. Fetch all existing 'original_id's from the database to prevent duplicates.
    const existingCatsResult = await sql`SELECT original_id FROM cats`;
    const existingIds = new Set(existingCatsResult.map((row: { original_id: string }) => row.original_id));

    // 3. Filter out the cats that are already in the database.
    const catsToInsert = allCatsFromSource.filter(cat => !existingIds.has(cat.id));

    // 4. If there's nothing new to insert, report success and exit.
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
    
    // 5. Insert new cats one by one. This is more robust than a single large query
    // or a complex transaction that was failing with the current driver.
    for (const cat of catsToInsert) {
        await sql`
            INSERT INTO cats (theme, url, original_id)
            VALUES (${cat.theme}, ${cat.url}, ${cat.id})
        `;
    }

    // 6. Report the final count after successful insertion.
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
    // Provide a more descriptive error message in the response.
    return { 
      statusCode: 500, 
      body: JSON.stringify({ success: false, message: `Internal Server Error: ${error.message}` }) 
    };
  }
};
