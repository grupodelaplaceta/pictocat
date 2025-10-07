// netlify/functions/get-catalog.ts
import { Handler } from '@netlify/functions';
import sql from './db';

export const handler: Handler = async () => {
  try {
    const cats = await sql`SELECT id, theme, url FROM cats ORDER BY id`;
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cats),
    };
  } catch (error) {
    console.error('Get catalog error:', error);
    return { statusCode: 500, body: 'Internal Server Error' };
  }
};
