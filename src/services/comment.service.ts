import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  increment,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { COLLECTIONS } from '@/config/constants';
import type { Comment } from '@/types/outfit.types';

export function subscribeToComments(
  outfitId: string,
  callback: (comments: Comment[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.OUTFITS, outfitId, COLLECTIONS.COMMENTS),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snap) => {
    const comments = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Comment[];
    callback(comments);
  });
}

export async function addComment(
  outfitId: string,
  data: {
    userId: string;
    username: string;
    userAvatarUrl: string | null;
    text: string;
  }
): Promise<void> {
  await addDoc(
    collection(db, COLLECTIONS.OUTFITS, outfitId, COLLECTIONS.COMMENTS),
    {
      ...data,
      createdAt: serverTimestamp(),
    }
  );

  await updateDoc(doc(db, COLLECTIONS.OUTFITS, outfitId), {
    commentCount: increment(1),
  });
}

export async function deleteComment(
  outfitId: string,
  commentId: string
): Promise<void> {
  await deleteDoc(
    doc(db, COLLECTIONS.OUTFITS, outfitId, COLLECTIONS.COMMENTS, commentId)
  );
  await updateDoc(doc(db, COLLECTIONS.OUTFITS, outfitId), {
    commentCount: increment(-1),
  });
}
