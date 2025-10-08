// netlify/functions/identity-signup.ts
import { Handler } from '@netlify/functions';
import getDb from './db';
import { getInitialUserData } from './_shared/data';

export const handler: Handler = async (event) => {
  if (!event.body) {
      return { statusCode: 400, body: 'No event body.' };
  }
  
  const { event: eventType, user } = JSON.parse(event.body);

  if (eventType !== 'signup') {
      return { statusCode: 200, body: `Event type ${eventType} ignored.` };
  }

  if (!user || !user.id || !user.email) {
    return { statusCode: 400, body: 'User data missing from event body.' };
  }

  try {
    const db = await getDb();
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({ _id: user.id });
    if (existingUser) {
      console.log(`User profile for ${user.id} already exists (webhook).`);
      return { statusCode: 200, body: 'User profile already exists.' };
    }
    
    const initialData = getInitialUserData();
    
    const baseUsername = `@${user.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20)}`;
    let finalUsername = baseUsername;
    let usernameCheck = await usersCollection.findOne({ username: finalUsername });

    while (usernameCheck) {
      const suffix = Math.floor(1000 + Math.random() * 9000);
      finalUsername = `${baseUsername.slice(0, 20)}${suffix}`;
      usernameCheck = await usersCollection.findOne({ username: finalUsername });
    }
    
    const newUserDoc = {
      _id: user.id,
      username: finalUsername,
      email: user.email,
      role: 'user',
      isVerified: true,
      ...initialData
    };

    await usersCollection.insertOne(newUserDoc);
    
    console.log(`Successfully created profile via webhook for user: ${user.id} as ${finalUsername}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Profile created for ${user.id}` }),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Identity-signup error:', errorMessage);
    return { 
        statusCode: 500, 
        body: JSON.stringify({ message: `Internal Server Error: ${errorMessage}` })
    };
  }
};
