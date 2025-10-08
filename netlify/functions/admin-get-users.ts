// netlify/functions/admin-get-users.ts
import { Handler, HandlerContext } from '@netlify/functions';
import getDb from './db';

export const handler: Handler = async (event, context: HandlerContext) => {
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

        const usersCursor = usersCollection.find({}, {
            projection: { _id: 1, username: 1, role: 1, isVerified: 1 },
            sort: { username: 1 }
        });
        const users = await usersCursor.toArray();

        const result = users.map(u => ({
            id: u._id,
            email: u.username,
            role: u.role,
            isVerified: u.isVerified
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
