// api/admin-get-public-phrases.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from './_utils/mongodb';
import { verifyToken } from './_utils/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const decodedToken = await verifyToken(req.headers.authorization);
        const db = await getDb();
        const usersCollection = db.collection('users');
        const publicPhrasesCollection = db.collection('public_phrases');

        const requestingUser = await usersCollection.findOne({ _id: decodedToken.sub });

        if (!requestingUser || requestingUser.role !== 'admin') {
            return res.status(403).send('Forbidden: Admins only.');
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

        return res.status(200).json(result);
    } catch (error) {
        console.error('Admin get public phrases error:', error);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).send('Unauthorized');
        }
        return res.status(500).send('Internal Server Error');
    }
}
