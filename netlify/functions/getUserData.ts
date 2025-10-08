// netlify/functions/getUserData.ts
import { Handler, HandlerContext } from '@netlify/functions';
import sql from './db';
import { getInitialUserData } from './_shared/data';

export const handler: Handler = async (event, context: HandlerContext) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  
  const { user } = context.clientContext;
  if (!user) {
      return { statusCode: 401, body: 'Unauthorized' };
  }

  try {
    let result = await sql`SELECT id, username, data, role, is_verified FROM users WHERE id = ${user.sub}`;

    if (result.length === 0) {
      // Profile not found, attempt to create it Just-In-Time (JIT).
      // This can be triggered by a race condition if the signup webhook is slow.
      console.log(`Profile not found for user ${user.sub}. Attempting JIT creation.`);
      
      // Ensure we have an email to create a username from.
      if (!user.email) {
        throw new Error(`Cannot create profile JIT: user object for ${user.sub} is missing an email address.`);
      }

      const initialData = getInitialUserData();
      
      // Derive a unique username. This logic must be resilient to race conditions.
      const baseUsername = `@${user.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20)}`;
      let finalUsername = baseUsername;
      
      // This username check-and-generate loop is not atomic and can fail in a race.
      // However, the subsequent INSERT with ON CONFLICT will handle the primary key (id) collision.
      // A unique constraint on 'username' could still cause an issue if two users try to register
      // with similar emails, but the random suffix makes this highly unlikely.
      let isUsernameTaken = (await sql`SELECT id FROM users WHERE username = ${finalUsername}`).length > 0;
      while (isUsernameTaken) {
        const suffix = Math.floor(1000 + Math.random() * 9000);
        finalUsername = `${baseUsername.slice(0, 20)}${suffix}`;
        isUsernameTaken = (await sql`SELECT id FROM users WHERE username = ${finalUsername}`).length > 0;
      }
      
      // Use INSERT ... ON CONFLICT to atomically handle the race condition where two requests
      // for the same new user arrive simultaneously. One will succeed, the other will do nothing.
      // Neither will throw a primary key violation error.
      await sql`
        INSERT INTO users (id, username, data, role, is_verified)
        VALUES (${user.sub}, ${finalUsername}, ${JSON.stringify(initialData)}, 'user', true)
        ON CONFLICT (id) DO NOTHING
      `;
      
      // After the atomic insert attempt, the profile should exist. Re-fetch it.
      result = await sql`SELECT id, username, data, role, is_verified FROM users WHERE id = ${user.sub}`;
      if (result.length === 0) {
        // If it's still not here, something went wrong beyond a simple race condition.
        throw new Error('Failed to retrieve user profile after JIT creation attempt.');
      }
    }
    
    const userProfile = {
      id: result[0].id,
      // The `username` column stores the public @username. We'll pass this to the frontend
      // via the `email` field of the UserProfile type to minimize frontend changes.
      email: result[0].username,
      data: result[0].data,
      role: result[0].role || 'user',
      isVerified: result[0].is_verified || false
    };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userProfile),
    };
  } catch (error) {
    console.error('Get/Create user data error:', error);
    return { statusCode: 500, body: 'Internal Server Error' };
  }
};