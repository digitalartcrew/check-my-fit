import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { COLLECTIONS } from '@/config/constants';
import { subscribeToComments } from '@/services/comment.service';
import { getUserRating } from '@/services/rating.service';
import type { Outfit, Comment } from '@/types/outfit.types';

export function useOutfit(outfitId: string, currentUserId?: string) {
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubOutfit = onSnapshot(
      doc(db, COLLECTIONS.OUTFITS, outfitId),
      (snap) => {
        if (snap.exists()) {
          setOutfit({ id: snap.id, ...snap.data() } as Outfit);
        }
        setLoading(false);
      }
    );

    const unsubComments = subscribeToComments(outfitId, setComments);

    return () => {
      unsubOutfit();
      unsubComments();
    };
  }, [outfitId]);

  useEffect(() => {
    if (!currentUserId) return;
    getUserRating(outfitId, currentUserId).then(setUserRating);
  }, [outfitId, currentUserId]);

  return { outfit, comments, userRating, loading };
}
