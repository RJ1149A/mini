import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Validate that required environment variables are set
const requiredEnvVars = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if any required env vars are missing or still have placeholder values
const missingVars = Object.entries(requiredEnvVars).filter(
  ([key, value]) => !value || 
  value.includes('your-') || 
  value === '123456789' ||
  value === 'your-api-key'
);

if (missingVars.length > 0 && typeof window !== 'undefined') {
  console.error('❌ Firebase Configuration Error:');
  console.error('Missing or invalid Firebase configuration. Please set up your .env.local file.');
  console.error('Missing variables:', missingVars.map(([key]) => key).join(', '));
  console.error('\n📝 To fix this:');
  console.error('1. Go to https://console.firebase.google.com/');
  console.error('2. Create/select a project');
  console.error('3. Go to Project Settings > General > Your apps');
  console.error('4. Add a web app and copy the config values');
  console.error('5. Update .env.local with your Firebase credentials');
  console.error('6. Restart your development server (npm run dev)');
}

const firebaseConfig = {
  apiKey: requiredEnvVars.apiKey || "your-api-key",
  authDomain: requiredEnvVars.authDomain || "your-project.firebaseapp.com",
  projectId: requiredEnvVars.projectId || "your-project-id",
  storageBucket: requiredEnvVars.storageBucket || "your-project.appspot.com",
  messagingSenderId: requiredEnvVars.messagingSenderId || "123456789",
  appId: requiredEnvVars.appId || "your-app-id"
};

// Initialize Firebase
let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  throw error;
}

// Initialize services with error handling
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';

let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (error) {
  console.error('❌ Firebase service initialization error:', error);
  console.error('Make sure Authentication, Firestore, and Storage are enabled in Firebase Console');
  throw error;
}

export { auth, db, storage };
export default app;

