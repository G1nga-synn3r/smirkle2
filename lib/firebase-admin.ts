import "server-only"; // Security: Ensures this code never runs in the browser
import admin from "firebase-admin";

/**
 * Smirkle2 Firebase Admin Initialization
 * This handles the connection between Vercel and your Firebase Database.
 */

const formatPrivateKey = (key: string | undefined) => {
  if (!key) return undefined;
  // This replaces literal '\n' characters with actual new lines
  return key.replace(/\\n/g, "\n");
};

const firebaseAdminConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
};

// Singleton check: If an app is already initialized, reuse it.
export const initAdmin = () => {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  return admin.initializeApp({
    credential: admin.credential.cert(firebaseAdminConfig),
    // Optional: Add your databaseURL if using Firebase Realtime DB
    // databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`
  });
};

// Export the specific tools you need for the game
export const db = initAdmin().firestore();
export const auth = initAdmin().auth();