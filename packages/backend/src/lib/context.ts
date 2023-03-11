import { ExpressContextFunctionArgument } from '@apollo/server/express4';
import { User } from '@prisma/client';
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

export const dataLoaders = {
  // Here we can add data loaders
} as ApolloContext['dataLoaders'];

export const createContext = async (
  args: ExpressContextFunctionArgument,
): Promise<ApolloContext> => {
  const { user, userProfile } = await authMiddleware(args);
  return { user, userProfile, dataLoaders } as ApolloContext;
};
