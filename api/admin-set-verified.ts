// api/admin-set-verified.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from './_utils/mongodb';
import { verifyToken } from './_utils/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        const decodedToken = await verifyToken(req.headers.authorization);
        const db = await getDb();
        const usersCollection = db.collection('users');

        const requestingUser = await usersCollection.findOne({ _id: decodedToken.sub });

        if (!requestingUser || requestingUser.role !== 'admin') {
            return res.status(403).send('Forbidden: Admins only.');
        }

        const { userId, isVerified } = req.body;

        if (!userId || typeof isVerified !== 'boolean') {
            return res.status(400).send('userId and isVerified status are required.');
        }

        await usersCollection.updateOne({ _id: userId }, { $set: { isVerified: isVerified } });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Admin set verified status error:', error);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).send('Unauthorized');
        }
        return res.status(500).send('Internal Server Error');
    }
}
