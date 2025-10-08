// netlify/functions/admin-censor-phrase.ts
import { Handler, HandlerContext } from '@netlify/functions';
import sql from './db';

export const handler: Handler = async (event, context: HandlerContext) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { user } = context.clientContext;
    // @ts-ignore
    const roles = user?.app_metadata?.roles || [];
    if (!user || !roles.includes('admin')) {
        return { statusCode: 401, body: 'Unauthorized: Admins only.' };
    }

    try {
        const { publicPhraseId } = JSON.parse(event.body || '{}');

        if (!publicPhraseId) {
            return { statusCode: 400, body: 'publicPhraseId is required.' };
        }

        await sql.begin(async (sql) => {
            // Find the original phrase to get the user_id and phrase_id
            const phraseInfoResult = await sql`
                SELECT user_id, phrase_id FROM public_phrases WHERE id = ${publicPhraseId}
            `;

            if (phraseInfoResult.length === 0) {
                // Phrase might have already been deleted, which is fine.
                return;
            }
            const { user_id, phrase_id } = phraseInfoResult[0];

            // Step 1: Delete from the public table
            await sql`DELETE FROM public_phrases WHERE id = ${publicPhraseId}`;

            // Step 2: Update the original user's data blob to set isPublic to false
            const userDataResult = await sql`SELECT data FROM users WHERE id = ${user_id}`;
            if (userDataResult.length > 0) {
                const userData = userDataResult[0].data;
                const phraseIndex = userData.phrases.findIndex(p => p.id === phrase_id);
                if (phraseIndex > -1) {
                    userData.phrases[phraseIndex].isPublic = false;
                    await sql`UPDATE users SET data = ${JSON.stringify(userData)} WHERE id = ${user_id}`;
                }
            }
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true }),
        };
    } catch (error) {
        console.error('Admin censor phrase error:', error);
        return { statusCode: 500, body: 'Internal Server Error' };
    }
};
