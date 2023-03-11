import axios from 'axios';

import { firebaseAuth } from './firebase';

export const createCustomToken = async (uid: string) => {
  const customToken = await firebaseAuth.createCustomToken(uid);
  return axios.post<{ idToken: string }>(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${
      process.env.FIREBASE_WEB_API_KEY as string
    }`,
    {
      token: customToken,
      returnSecureToken: true,
    },
  );
};
