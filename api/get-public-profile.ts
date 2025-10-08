// api/get-public-profile.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from './_utils/mongodb';
import { verifyToken } from './_utils/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await verifyToken(req.headers.authorization); // Secure the endpoint
    const username = req.query.username as string;

    if (!username) {
        return res.status(400).send('Username is required');
    }

    const db = await getDb();
    const usersCollection = db.collection('users');
    const publicPhrasesCollection = db.collection('public_phrases');

    const targetUser = await usersCollection.findOne({ username: username });
    if (!targetUser) {
        return res.status(404).send('User not found');
    }

    const phrasesCursor = publicPhrasesCollection.find({ userId: targetUser._id }).sort({ _id: -1 });
    const phrasesFromDb = await phrasesCursor.toArray();
    
    const publicPhrases = phrasesFromDb.map(p => ({
        publicPhraseId: p._id.toHexString(),
        text: p.text,
        imageUrl: p.imageUrl,
        imageTheme: p.imageTheme
    }));
    
    const profileData = {
        username: targetUser.username,
        isVerified: targetUser.isVerified,
        phrases: publicPhrases
    };

    return res.status(200).json(profileData);
  } catch (error) {
    console.error('Get public profile error:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).send('Unauthorized');
    }
    return res.status(500).send('Internal Server Error');
  }
}
