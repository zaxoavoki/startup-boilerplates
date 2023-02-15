import { ExpressContext } from 'apollo-server-express';
import { auth } from 'firebase-admin';

import { authMiddleware } from '../middlewares/auth';

export type ApolloContext = (
  | {
      user: auth.UserRecord;
      userProfile: unknown; // Replace with your value
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
