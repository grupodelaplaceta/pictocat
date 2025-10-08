// netlify/functions/admin-set-verified.ts
import { Handler, HandlerContext } from '@netlify/functions';
import getDb from './db';

export const handler: Handler = async (event, context: HandlerContext) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { user } = context.clientContext;
    if (!user) {
        return { statusCode: 401, body: 'Unauthorized' };
    }

    try {
        const db = await getDb();
        const usersCollection = db.collection('users');
        
        const requestingUser = await usersCollection.findOne({ _id: user.sub });
        if (!requestingUser || requestingUser.role !== 'admin') {
            return { statusCode: 403, body: 'Forbidden: Admins only.' };
        }

        const { userId, isVerified } = JSON.parse(event.body || '{}');

        if (!userId || typeof isVerified !== 'boolean') {
            return { statusCode: 400, body: 'userId and isVerified status are required.' };
        }

        await usersCollection.updateOne({ _id: userId }, { $set: { isVerified: isVerified } });

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true }),
        };
    } catch (error) {
        console.error('Admin set verified status error:', error);
        return { statusCode: 500, body: 'Internal Server Error' };
    }
};
