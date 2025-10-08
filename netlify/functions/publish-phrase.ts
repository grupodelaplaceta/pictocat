// netlify/functions/publish-phrase.ts
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
        const { phrase, image, isPublic } = JSON.parse(event.body || '{}');

        if (!phrase || !phrase.id || !image || !image.url) {
            return { statusCode: 400, body: 'Invalid phrase data provided.' };
        }
        
        const db = await getDb();
        const publicPhrasesCollection = db.collection('public_phrases');
        const usersCollection = db.collection('users');

        if (isPublic) {
            const userData = await usersCollection.findOne({ _id: user.sub }, { projection: { username: 1 }});
             if (!userData) {
                return { statusCode: 404, body: 'User not found.' };
            }
            await publicPhrasesCollection.updateOne(
                { userId: user.sub, phraseId: phrase.id },
                { 
                    $set: {
                        userId: user.sub,
                        phraseId: phrase.id,
                        username: userData.username,
                        text: phrase.text,
                        imageUrl: image.url,
                        imageTheme: image.theme
                    }
                },
                { upsert: true }
            );
        } else {
            await publicPhrasesCollection.deleteOne({ userId: user.sub, phraseId: phrase.id });
        }

        await usersCollection.updateOne(
            { _id: user.sub, 'phrases.id': phrase.id },
            { $set: { 'phrases.$.isPublic': isPublic } }
        );

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true }),
        };
    } catch (error) {
        console.error('Publish phrase error:', error);
        return { statusCode: 500, body: 'Internal Server Error' };
    }
};
