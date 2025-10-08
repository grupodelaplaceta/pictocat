// api/admin-censor-phrase.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from './_utils/mongodb';
import { verifyToken } from './_utils/auth';
import { ObjectId } from 'mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        const decodedToken = await verifyToken(req.headers.authorization);
        const db = await getDb();
        const usersCollection = db.collection('users');
        const publicPhrasesCollection = db.collection('public_phrases');

        const requestingUser = await usersCollection.findOne({ _id: decodedToken.sub });
        if (!requestingUser || requestingUser.role !== 'admin') {
            return res.status(403).send('Forbidden: Admins only.');
        }

        const { publicPhraseId } = req.body;
        if (!publicPhraseId) {
            return res.status(400).send('publicPhraseId is required.');
        }

        const phraseToDelete = await publicPhrasesCollection.findOne({ _id: new ObjectId(publicPhraseId) });

        if (phraseToDelete) {
            // Delete from public collection
            await publicPhrasesCollection.deleteOne({ _id: new ObjectId(publicPhraseId) });

            // Update original user's data
            await usersCollection.updateOne(
                { _id: phraseToDelete.userId, 'phrases.id': phraseToDelete.phraseId },
                { $set: { 'phrases.$.isPublic': false } }
            );
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Admin censor phrase error:', error);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).send('Unauthorized');
        }
        return res.status(500).send('Internal Server Error');
    }
}
