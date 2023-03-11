import { ExpressContextFunctionArgument } from '@apollo/server/express4';
import { User } from '@prisma/client';
import { auth } from 'firebase-admin';

import { NodeEnv } from '../lib/enums';
import { firebaseAuth } from '../lib/firebase';
import { prisma } from '../prisma';

export const authMiddleware = async ({
  req,
}: ExpressContextFunctionArgument) => {
  const [, token] = req.headers.authorization?.split('Bearer ') ?? [];

  if (process.env.NODE_ENV === NodeEnv.Dev && !token) {
    const userProfile = await prisma.user.findFirst();
    if (!userProfile) {
      throw new Error('User was not found');
    }

    return { user: null, userProfile } as unknown as {
      user: auth.UserRecord;
      userProfile: User;
    };
  }

  if (!token) {
    return { user: null, userProfile: null };
  }

  try {
    const decodedToken = await firebaseAuth.verifyIdToken(token);
    const user = await firebaseAuth.getUser(decodedToken.uid);
    const userProfile = await prisma.user.findUnique({
      where: { firebaseId: user.uid },
    });

    return { user, userProfile };
  } catch (error) {
    console.error(error);
    return { user: null, userProfile: null };
  }
};
