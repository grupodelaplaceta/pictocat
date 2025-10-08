// api/getUserData.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from './_utils/mongodb';
import { getInitialUserData } from './_shared/data';
import { verifyToken } from './_utils/auth';
import { UserProfile } from '../types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).send('Method Not Allowed');
  }
  
  try {
    const decodedToken = await verifyToken(req.headers.authorization);
    const userId = decodedToken.sub;
    
    const db = await getDb();
    const usersCollection = db.collection('users');
    let userFromDb = await usersCollection.findOne({ _id: userId });

    if (!userFromDb) {
      console.log(`Profile not found for user ${userId}. Attempting JIT creation.`);
      
      const userEmail = decodedToken.email;
      if (!userEmail) {
        throw new Error(`Cannot create profile JIT: user token for ${userId} is missing an email claim.`);
      }

      const initialData = getInitialUserData();
      
      const baseUsername = `@${userEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20)}`;
      let finalUsername = baseUsername;
      
      let usernameCheck = await usersCollection.findOne({ username: finalUsername });
      while (usernameCheck) {
        const suffix = Math.floor(1000 + Math.random() * 9000);
        finalUsername = `${baseUsername.slice(0, 20)}${suffix}`;
        usernameCheck = await usersCollection.findOne({ username: finalUsername });
      }

      const newUserDoc = {
        _id: userId,
        username: finalUsername,
        email: userEmail,
        role: 'user',
        isVerified: true,
        ...initialData
      };
      
      await usersCollection.insertOne(newUserDoc);
      userFromDb = newUserDoc;
    }
    
    // Reconstruct the nested 'data' object for the frontend
    const userProfile: UserProfile = {
      id: userFromDb._id,
      email: userFromDb.username, // Frontend uses 'email' field for the username
      role: userFromDb.role || 'user',
      isVerified: userFromDb.isVerified || false,
      data: {
        coins: userFromDb.coins,
        phrases: userFromDb.phrases,
        unlockedImageIds: userFromDb.unlockedImageIds,
        playerStats: userFromDb.playerStats,
        purchasedUpgrades: userFromDb.purchasedUpgrades,
      }
    };

    return res.status(200).json(userProfile);

  } catch (error) {
    console.error('Get/Create user data error:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).send('Unauthorized');
    }
    return res.status(500).send('Internal Server Error');
  }
}
