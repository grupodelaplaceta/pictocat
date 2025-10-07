// netlify/functions/create-profile.ts
import { Handler, HandlerContext } from '@netlify/functions';
import sql from './db';
import { getInitialUserData } from './_shared/data';

export const handler: Handler = async (event, context: HandlerContext) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { user } = context.clientContext;
  if (!user) {
      return { statusCode: 401, body: 'Unauthorized' };
  }

  try {
    const { username } = JSON.parse(event.body || '{}');
    if (!username || typeof username !== 'string' || !username.startsWith('@') || username.length < 4) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Invalid username format.' }) };
    }

    // Check if user already has a profile
    const existingProfile = await sql`SELECT 1 FROM users WHERE id = ${user.sub}`;
    if (existingProfile.length > 0) {
      return { statusCode: 409, body: JSON.stringify({ message: 'User profile already exists.' }) };
    }

    // Check if username is taken
    const usernameTaken = await sql`SELECT 1 FROM users WHERE username = ${username}`;
    if (usernameTaken.length > 0) {
      return { statusCode: 409, body: JSON.stringify({ message: 'Username is already taken.' }) };
    }

    // Create new user profile with initial data
    const initialData = getInitialUserData();
    await sql`INSERT INTO users (id, username, data) VALUES (${user.sub}, ${username}, ${JSON.stringify(initialData)})`;
    
    const newUserProfile = { id: user.sub, username, data: initialData };

    return {
      statusCode: 201, // 201 Created
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, profile: newUserProfile }),
    };
  } catch (error) {
    console.error('Create profile error:', error);
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal Server Error' }) };
  }
};
