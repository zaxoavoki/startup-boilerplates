import * as admin from 'firebase-admin';

export const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert({
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});

export const firebaseAuth = firebaseApp.auth();
