// netlify/functions/search-users.ts
import { Handler, HandlerContext } from '@netlify/functions';
import getDb from './db';

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
    const db = await getDb();
    const usersCollection = db.collection('users');

    const searchPattern = new RegExp(query, 'i');
    const usersCursor = usersCollection.find(
        { username: { $regex: searchPattern } },
        { projection: { username: 1, isVerified: 1 }, limit: 10 }
    );
    const users = await usersCursor.toArray();

    const searchResults = users.map(u => ({
        username: u.username,
        isVerified: u.isVerified
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
