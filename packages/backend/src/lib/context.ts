import { User } from '@prisma/client';
import { ExpressContext } from 'apollo-server-express';
import { auth } from 'firebase-admin';

import { authMiddleware } from '../middlewares/auth';

export type ApolloContext = (
  | {
      user: auth.UserRecord;
      userProfile: User;
    }
  | { user: null; userProfile: null }
) & {
  dataLoaders: Record<string, unknown>;
};

export const dataLoaders = {} as ApolloContext['dataLoaders'];

export const createContext = async ({
  req,
}: ExpressContext): Promise<ApolloContext> => {
  const { user, userProfile } = await authMiddleware({ req });
  return { user, userProfile, dataLoaders } as ApolloContext;
};
