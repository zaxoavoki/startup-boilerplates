import casual from 'casual';
import { config } from 'dotenv';

import { NodeEnv } from '../../lib/enums';

casual.seed(123);

config();

process.env.NODE_ENV = NodeEnv.Testing;
process.env.DATABASE_URL = process.env.TESTING_DATABASE_URL;

export const uid = casual.uuid;

jest.setTimeout(10000);
jest.mock('../../lib/firebase', () => ({
  __esModule: true,
  firebaseAuth: {
    getUser: () => ({ uid }),
    verifyIdToken: () => ({ uid }),
    updateUser: (uid: string) => ({ uid }),
    deleteUser: (uid: string) => uid,
  },
}));
