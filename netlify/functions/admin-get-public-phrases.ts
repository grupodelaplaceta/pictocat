// netlify/functions/admin-get-public-phrases.ts
import { Handler, HandlerContext } from '@netlify/functions';
import sql from './db';

export const handler: Handler = async (event, context: HandlerContext) => {
    const { user } = context.clientContext;
    // @ts-ignore
    const roles = user?.app_metadata?.roles || [];
    if (!user || !roles.includes('admin')) {
        return { statusCode: 401, body: 'Unauthorized: Admins only.' };
    }

    try {
        const phrases = await sql`
            SELECT
                pp.id,
                pp.user_id,
                u.username,
                pp.text,
                pp.image_url,
                pp.image_theme
            FROM public_phrases pp
            JOIN users u ON pp.user_id = u.id
            ORDER BY pp.id DESC
        `;

        const result = phrases.map(p => ({
            publicPhraseId: p.id,
            userId: p.user_id,
            email: p.username, // 'username' column stores the email
            text: p.text,
            imageUrl: p.image_url,
            imageTheme: p.image_theme,
        }));

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result),
        };
    } catch (error) {
        console.error('Admin get public phrases error:', error);
        return { statusCode: 500, body: 'Internal Server Error' };
    }
};