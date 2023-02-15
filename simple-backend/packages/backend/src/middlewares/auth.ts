import { Request } from 'express';

import { NodeEnv } from '../lib/enums';
import { firebaseAuth } from '../lib/firebase';

export const authMiddleware = async ({ req }: { req: Request }) => {
  const [, token] = req.headers.authorization?.split('Bearer ') ?? [];

  if (process.env.NODE_ENV === NodeEnv.Dev && !token) {
    const userProfile = {};
    if (!userProfile) {
      throw new Error('User was not found');
    }

    return { user: null, userProfile };
  }

  if (!token) {
    return { user: null, userProfile: null };
  }

  try {
    const decodedToken = await firebaseAuth.verifyIdToken(token);
    const user = await firebaseAuth.getUser(decodedToken.uid);
    const userProfile = {};

    return { user, userProfile };
  } catch (error) {
    console.error(error);
    return { user: null, userProfile: null };
  }
};
