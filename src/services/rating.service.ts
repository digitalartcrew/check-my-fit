import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { COLLECTIONS } from '@/config/constants';
import type { Rating } from '@/types/outfit.types';

export async function submitRating(
  outfitId: string,
  userId: string,
  value: number
): Promise<void> {
  const ratingRef = doc(
    db,
    COLLECTIONS.OUTFITS,
    outfitId,
    COLLECTIONS.RATINGS,
    userId
  );

  const existing = await getDoc(ratingRef);

  if (existing.exists()) {
    await setDoc(ratingRef, {
      userId,
      value,
      createdAt: existing.data().createdAt,
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDoc(ratingRef, {
      userId,
      value,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  // averageRating and ratingCount are recalculated by Cloud Function trigger
}

export async function getUserRating(
  outfitId: string,
  userId: string
): Promise<number | null> {
  const ratingRef = doc(
    db,
    COLLECTIONS.OUTFITS,
    outfitId,
    COLLECTIONS.RATINGS,
    userId
  );
  const snap = await getDoc(ratingRef);
  if (!snap.exists()) return null;
  return (snap.data() as Rating).value;
}
