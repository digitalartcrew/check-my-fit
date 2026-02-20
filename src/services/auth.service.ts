import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  query,
  collection,
  where,
  getDocs,
  limit,
} from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { COLLECTIONS } from '@/config/constants';

export async function signUp(
  email: string,
  password: string,
  username: string,
  displayName: string
) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const { user } = credential;

  await updateProfile(user, { displayName });

  await setDoc(doc(db, COLLECTIONS.USERS, user.uid), {
    uid: user.uid,
    username: username.toLowerCase(),
    displayName,
    avatarUrl: null,
    bio: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    stats: {
      outfitCount: 0,
      totalRatingsReceived: 0,
      averageRatingReceived: 0,
    },
  });

  return user;
}

export async function signIn(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signOut() {
  await firebaseSignOut(auth);
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
  const q = query(
    collection(db, COLLECTIONS.USERS),
    where('username', '==', username.toLowerCase()),
    limit(1)
  );
  const snap = await getDocs(q);
  return snap.empty;
}

export async function updateUserProfile(
  uid: string,
  updates: { displayName?: string; bio?: string; avatarUrl?: string | null }
) {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
  if (updates.displayName && auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: updates.displayName });
  }
}
