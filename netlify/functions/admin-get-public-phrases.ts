// netlify/functions/admin-get-public-phrases.ts
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
        const publicPhrasesCollection = db.collection('public_phrases');

        const requestingUser = await usersCollection.findOne({ _id: user.sub });
        if (!requestingUser || requestingUser.role !== 'admin') {
            return { statusCode: 403, body: 'Forbidden: Admins only.' };
        }

        const phrasesCursor = publicPhrasesCollection.find({}).sort({ _id: -1 });
        const phrases = await phrasesCursor.toArray();

        const result = phrases.map(p => ({
            publicPhraseId: p._id.toHexString(),
            userId: p.userId,
            email: p.username,
            text: p.text,
            imageUrl: p.imageUrl,
            imageTheme: p.imageTheme,
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
