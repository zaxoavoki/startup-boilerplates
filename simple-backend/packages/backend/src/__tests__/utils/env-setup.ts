import casual from 'casual';
import { config } from 'dotenv';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';

casual.seed(123);

config();

jest.mock('../../lib/firebase', () => ({
  __esModule: true,
  firebaseAuth: {
    getUser: () => null,
    updateUser: (uid: string) =>
      Promise.resolve({
        uid,
      } as UserRecord),
    deleteUser: (uid: string) => uid,
  },
}));
