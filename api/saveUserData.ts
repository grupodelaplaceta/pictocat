// api/saveUserData.ts
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
    const { data } = req.body || {};

    if (!data) {
      return res.status(400).send('User data is required');
    }

    const db = await getDb();
    const usersCollection = db.collection('users');

    // Using $set to update fields in the user document
    await usersCollection.updateOne({ _id: userId }, { $set: data });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Save user data error:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).send('Unauthorized');
    }
    return res.status(500).send('Internal Server Error');
  }
}
