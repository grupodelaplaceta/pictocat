// netlify/functions/admin-get-users.ts
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
        const users = await sql`
            SELECT id, username, role, is_verified
            FROM users
            ORDER BY username ASC
        `;

        const result = users.map(u => ({
            id: u.id,
            email: u.username, // 'username' column stores the email
            role: u.role,
            isVerified: u.is_verified
        }));

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result),
        };
    } catch (error) {
        console.error('Admin get users error:', error);
        return { statusCode: 500, body: 'Internal Server Error' };
    }
};