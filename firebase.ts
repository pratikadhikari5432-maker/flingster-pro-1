import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, updateDoc, increment, serverTimestamp, setDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile } from '../../types';

const app = initializeApp(firebaseConfig);
// Using firestoreDatabaseId from the config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const deductCredits = async (email: string, amount: number) => {
  try {
    const userRef = doc(db, 'users', email.toLowerCase());
    await updateDoc(userRef, {
      credits: increment(-amount)
    });
    return true;
  } catch (error) {
    console.error("Credit deduction failed:", error);
    return false;
  }
};

export const syncUserToFirestore = async (user: UserProfile) => {
  try {
    const userRef = doc(db, 'users', user.email.toLowerCase());
    await setDoc(userRef, {
      ...user,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Sync to Firestore failed:", error);
  }
};

// Export initialization
export { app };
