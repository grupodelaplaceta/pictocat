// netlify/functions/publish-phrase.ts
import { Handler, HandlerContext } from '@netlify/functions';
import sql from './db';

export const handler: Handler = async (event, context: HandlerContext) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
    
    const { user } = context.clientContext;
    if (!user) {
        return { statusCode: 401, body: 'Unauthorized' };
    }

    try {
        const { phrase, image, isPublic } = JSON.parse(event.body || '{}');

        if (!phrase || !phrase.id || !image || !image.url) {
            return { statusCode: 400, body: 'Invalid phrase data provided.' };
        }
        
        // Atomically update both the public table and the user's data blob
        await sql.begin(async (sql) => {
            // Step 1: Update the public_phrases table
            if (isPublic) {
                // Insert or update the public phrase. Using user_id and phrase_id as a unique key.
                await sql`
                    INSERT INTO public_phrases (user_id, phrase_id, text, image_url, image_theme)
                    VALUES (${user.sub}, ${phrase.id}, ${phrase.text}, ${image.url}, ${image.theme})
                    ON CONFLICT (user_id, phrase_id)
                    DO UPDATE SET
                        text = EXCLUDED.text,
                        image_url = EXCLUDED.image_url,
                        image_theme = EXCLUDED.image_theme
                `;
            } else {
                // Remove from public phrases
                await sql`DELETE FROM public_phrases WHERE user_id = ${user.sub} AND phrase_id = ${phrase.id}`;
            }

            // Step 2: Update the isPublic flag within the user's JSON data
            // This is complex with jsonb. We fetch, update in JS, then write back.
            const userDataResult = await sql`SELECT data FROM users WHERE id = ${user.sub}`;
            if (userDataResult.length > 0) {
                const userData = userDataResult[0].data;
                const phraseIndex = userData.phrases.findIndex(p => p.id === phrase.id);

                if (phraseIndex > -1) {
                    userData.phrases[phraseIndex].isPublic = isPublic;
                    await sql`UPDATE users SET data = ${JSON.stringify(userData)} WHERE id = ${user.sub}`;
                }
            }
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true }),
        };
    } catch (error) {
        console.error('Publish phrase error:', error);
        return { statusCode: 500, body: 'Internal Server Error' };
    }
};
