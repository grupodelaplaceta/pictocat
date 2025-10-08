// netlify/functions/search-users.ts
import { Handler, HandlerContext } from '@netlify/functions';
import sql from './db';

export const handler: Handler = async (event, context: HandlerContext) => {
  const { user } = context.clientContext;
  if (!user) {
      return { statusCode: 401, body: 'Unauthorized' };
  }

  const query = event.queryStringParameters?.q;
  if (!query || query.length < 2) {
      return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify([]) };
  }

  try {
    // Use ILIKE for case-insensitive search and '%' for wildcard matching
    const searchPattern = `%${query}%`;
    const users = await sql`
        SELECT username, is_verified
        FROM users
        WHERE username ILIKE ${searchPattern}
        LIMIT 10
    `;

    const searchResults = users.map(u => ({
        username: u.username,
        isVerified: u.is_verified
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(searchResults),
    };
  } catch (error) {
    console.error('Search users error:', error);
    return { statusCode: 500, body: 'Internal Server Error' };
  }
};
