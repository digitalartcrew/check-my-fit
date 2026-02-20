import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { COLLECTIONS } from '@/config/constants';
import { fetchUserOutfits } from '@/services/outfit.service';
import type { UserProfile } from '@/types/user.types';
import type { Outfit } from '@/types/outfit.types';

export function useUserProfile(userId: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, COLLECTIONS.USERS, userId),
      (snap) => {
        if (snap.exists()) {
          setProfile({ uid: snap.id, ...snap.data() } as UserProfile);
        }
        setLoading(false);
      }
    );

    fetchUserOutfits(userId).then(setOutfits);

    return unsub;
  }, [userId]);

  return { profile, outfits, loading };
}
