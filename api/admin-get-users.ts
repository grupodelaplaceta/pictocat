// api/admin-get-users.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from './_utils/mongodb';
import { verifyToken } from './_utils/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const decodedToken = await verifyToken(req.headers.authorization);
        
        const db = await getDb();
        const usersCollection = db.collection('users');

        const requestingUser = await usersCollection.findOne({ _id: decodedToken.sub });

        if (!requestingUser || requestingUser.role !== 'admin') {
            return res.status(403).send('Forbidden: Admins only.');
        }

        const usersCursor = usersCollection.find({}, {
            projection: { _id: 1, username: 1, role: 1, isVerified: 1 },
            sort: { username: 1 }
        });

        const users = await usersCursor.toArray();

        const result = users.map(u => ({
            id: u._id,
            email: u.username, // Maintain frontend contract
            role: u.role,
            isVerified: u.isVerified
        }));

        return res.status(200).json(result);
    } catch (error) {
        console.error('Admin get users error:', error);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).send('Unauthorized');
        }
        return res.status(500).send('Internal Server Error');
    }
}
