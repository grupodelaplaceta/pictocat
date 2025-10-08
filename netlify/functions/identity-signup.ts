// netlify/functions/identity-signup.ts
import { Handler } from '@netlify/functions';
import sql from './db';
import { getInitialUserData } from './_shared/data';

// This function is triggered by Netlify Identity when a new user signs up and is verified.
export const handler: Handler = async (event) => {
  if (!event.body) {
      return { statusCode: 400, body: 'No event body.' };
  }
  
  const { event: eventType, user } = JSON.parse(event.body);

  // This function is for the 'signup' event.
  // Netlify might also send 'login', 'validate', etc., to this webhook if configured.
  if (eventType !== 'signup') {
      return { statusCode: 200, body: `Event type ${eventType} ignored.` };
  }

  if (!user || !user.id || !user.email) {
    return { statusCode: 400, body: 'User data missing from event body.' };
  }

  try {
    // Check if user already has a profile to make this function idempotent
    const existingUser = await sql`SELECT id FROM users WHERE id = ${user.id}`;
    if (existingUser.length > 0) {
      console.log(`User profile for ${user.id} already exists (webhook).`);
      return { statusCode: 200, body: 'User profile already exists.' };
    }
    
    const initialData = getInitialUserData();
    
    // Derive a unique username from the email address.
    const baseUsername = `@${user.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20)}`;
    let finalUsername = baseUsername;
    let isUsernameTaken = (await sql`SELECT id FROM users WHERE username = ${finalUsername}`).length > 0;

    while (isUsernameTaken) {
      const suffix = Math.floor(1000 + Math.random() * 9000);
      finalUsername = `${baseUsername.slice(0, 20)}${suffix}`;
      isUsernameTaken = (await sql`SELECT id FROM users WHERE username = ${finalUsername}`).length > 0;
    }
    
    // The 'signup' event fires upon email confirmation, so the user is verified.
    await sql`
        INSERT INTO users (id, username, data, role, is_verified)
        VALUES (${user.id}, ${finalUsername}, ${JSON.stringify(initialData)}, 'user', true)
    `;
    
    console.log(`Successfully created profile via webhook for user: ${user.id} as ${finalUsername}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Profile created for ${user.id}` }),
    };
  } catch (error) {
    // Use a more specific type for error if possible, but 'any' is safe here.
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Identity-signup error:', errorMessage);
    return { 
        statusCode: 500, 
        body: JSON.stringify({ message: `Internal Server Error: ${errorMessage}` })
    };
  }
};
