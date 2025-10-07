// netlify/functions/getUserData.ts
import { Handler, HandlerContext } from '@netlify/functions';
import sql from './db';

export const handler: Handler = async (event, context: HandlerContext) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  
  const { user } = context.clientContext;
  if (!user) {
      return { statusCode: 401, body: 'Unauthorized' };
  }

  try {
    const result = await sql`SELECT id, username, data FROM users WHERE id = ${user.sub}`;

    if (result.length === 0) {
      return { statusCode: 404, body: 'User profile not found. Please create one.' };
    }
    
    const userProfile = result[0];

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userProfile),
    };
  } catch (error) {
    console.error('Get user data error:', error);
    return { statusCode: 500, body: 'Internal Server Error' };
  }
};