// api/publish-phrase.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from './_utils/mongodb';
import { verifyToken } from './_utils/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }
    
    try {
        const decodedToken = await verifyToken(req.headers.authorization);
        const userId = decodedToken.sub;
        const { phrase, image, isPublic } = req.body || {};

        if (!phrase || !phrase.id || !image || !image.url) {
            return res.status(400).send('Invalid phrase data provided.');
        }
        
        const db = await getDb();
        const publicPhrasesCollection = db.collection('public_phrases');
        const usersCollection = db.collection('users');

        // Step 1: Update the public_phrases collection
        if (isPublic) {
            const user = await usersCollection.findOne({ _id: userId }, { projection: { username: 1 }});
            if (!user) {
                return res.status(404).send('User not found.');
            }
            await publicPhrasesCollection.updateOne(
                { userId: userId, phraseId: phrase.id },
                { 
                    $set: {
                        userId: userId,
                        phraseId: phrase.id,
                        username: user.username,
                        text: phrase.text,
                        imageUrl: image.url,
                        imageTheme: image.theme
                    }
                },
                { upsert: true }
            );
        } else {
            await publicPhrasesCollection.deleteOne({ userId: userId, phraseId: phrase.id });
        }

        // Step 2: Update the isPublic flag within the user's data
        await usersCollection.updateOne(
            { _id: userId, 'phrases.id': phrase.id },
            { $set: { 'phrases.$.isPublic': isPublic } }
        );

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Publish phrase error:', error);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).send('Unauthorized');
        }
        return res.status(500).send('Internal Server Error');
    }
}
