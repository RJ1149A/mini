import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  User 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const ALLOWED_DOMAIN = 'miet.ac.in';

export const validateEmail = (email: string): boolean => {
  return email.endsWith(`@${ALLOWED_DOMAIN}`);
};

export const signUp = async (email: string, password: string, name: string) => {
  if (!validateEmail(email)) {
    throw new Error(`Only ${ALLOWED_DOMAIN} email addresses are allowed`);
  }

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Create user document in Firestore
  await setDoc(doc(db, 'users', user.uid), {
    email: user.email,
    name: name,
    createdAt: new Date().toISOString(),
    photoURL: '',
    videos: [],
    photos: []
  });

  return userCredential;
};

export const signIn = async (email: string, password: string) => {
  if (!validateEmail(email)) {
    throw new Error(`Only ${ALLOWED_DOMAIN} email addresses are allowed`);
  }

  return await signInWithEmailAndPassword(auth, email, password);
};

export const logOut = async () => {
  return await signOut(auth);
};

export const getUserData = async (uid: string) => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return userDoc.data();
  }
  return null;
};

