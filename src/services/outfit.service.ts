import {
  collection,
  doc,
  addDoc,
  getDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  getDocs,
  serverTimestamp,
  DocumentSnapshot,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { COLLECTIONS, LIMITS } from '@/config/constants';
import type { Outfit } from '@/types/outfit.types';

function docToOutfit(snap: DocumentSnapshot): Outfit {
  const data = snap.data()!;
  return { id: snap.id, ...data } as Outfit;
}

export async function createOutfit(data: {
  userId: string;
  username: string;
  userAvatarUrl: string | null;
  imageUrl: string;
  storagePath: string;
  caption: string;
  tags: string[];
}): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.OUTFITS), {
    ...data,
    createdAt: serverTimestamp(),
    ratingCount: 0,
    averageRating: 0,
    commentCount: 0,
    aiSuggestionGeneratedAt: null,
  });

  // Increment user outfit count
  await updateDoc(doc(db, COLLECTIONS.USERS, data.userId), {
    'stats.outfitCount': increment(1),
  });

  return ref.id;
}

export async function fetchOutfitById(outfitId: string): Promise<Outfit | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.OUTFITS, outfitId));
  if (!snap.exists()) return null;
  return docToOutfit(snap);
}

export async function fetchFeedPage(
  lastDoc: DocumentSnapshot | null
): Promise<{ outfits: Outfit[]; lastDoc: DocumentSnapshot | null }> {
  let q = query(
    collection(db, COLLECTIONS.OUTFITS),
    orderBy('createdAt', 'desc'),
    limit(LIMITS.FEED_PAGE_SIZE)
  );

  if (lastDoc) {
    q = query(
      collection(db, COLLECTIONS.OUTFITS),
      orderBy('createdAt', 'desc'),
      startAfter(lastDoc),
      limit(LIMITS.FEED_PAGE_SIZE)
    );
  }

  const snap = await getDocs(q);
  const outfits = snap.docs.map(docToOutfit);
  const newLastDoc = snap.docs[snap.docs.length - 1] ?? null;

  return { outfits, lastDoc: newLastDoc };
}

export async function fetchUserOutfits(userId: string): Promise<Outfit[]> {
  const q = query(
    collection(db, COLLECTIONS.OUTFITS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(docToOutfit);
}

export async function deleteOutfit(outfitId: string, userId: string) {
  await deleteDoc(doc(db, COLLECTIONS.OUTFITS, outfitId));
  await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
    'stats.outfitCount': increment(-1),
  });
}
