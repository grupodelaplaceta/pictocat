// netlify/functions/get-public-profile.ts
import { Handler, HandlerContext } from '@netlify/functions';
import sql from './db';

export const handler: Handler = async (event, context: HandlerContext) => {
  const { user } = context.clientContext;
  if (!user) {
      return { statusCode: 401, body: 'Unauthorized' };
  }

  const username = event.queryStringParameters?.username;
  if (!username) {
      return { statusCode: 400, body: 'Username is required' };
  }

  try {
    // Get user info
    const userInfoResult = await sql`SELECT id, username, is_verified FROM users WHERE username = ${username}`;
    if (userInfoResult.length === 0) {
        return { statusCode: 404, body: 'User not found' };
    }
    const targetUser = userInfoResult[0];

    // Get public phrases for that user
    const phrasesResult = await sql`
        SELECT id, text, image_url, image_theme
        FROM public_phrases
        WHERE user_id = ${targetUser.id}
        ORDER BY id DESC
    `;
    
    const publicPhrases = phrasesResult.map(p => ({
        publicPhraseId: p.id,
        text: p.text,
        imageUrl: p.image_url,
        imageTheme: p.image_theme
    }));
    
    const profileData = {
        username: targetUser.username,
        isVerified: targetUser.is_verified,
        phrases: publicPhrases
    };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    };
  } catch (error) {
    console.error('Get public profile error:', error);
    return { statusCode: 500, body: 'Internal Server Error' };
  }
};