// netlify/functions/admin-set-verified.ts
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
        const { userId, isVerified } = JSON.parse(event.body || '{}');

        if (!userId || typeof isVerified !== 'boolean') {
            return { statusCode: 400, body: 'userId and isVerified status are required.' };
        }

        await sql`UPDATE users SET is_verified = ${isVerified} WHERE id = ${userId}`;

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true }),
        };
    } catch (error) {
        console.error('Admin set verified status error:', error);
        return { statusCode: 500, body: 'Internal Server Error' };
    }
};
