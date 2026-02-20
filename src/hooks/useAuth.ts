import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { useAuthStore } from '@/stores/auth.store';
import { COLLECTIONS } from '@/config/constants';
import type { UserProfile } from '@/types/user.types';

export function useAuthListener() {
  const { setUser, setProfile, setLoading, setHydrated, reset } = useAuthStore();

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);

      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      if (user) {
        unsubProfile = onSnapshot(
          doc(db, COLLECTIONS.USERS, user.uid),
          (snap) => {
            if (snap.exists()) {
              setProfile({ uid: snap.id, ...snap.data() } as UserProfile);
            }
            setLoading(false);
            setHydrated(true);
          },
          () => {
            setLoading(false);
            setHydrated(true);
          }
        );
      } else {
        reset();
        setHydrated(true);
      }
    });

    return () => {
      unsubAuth();
      unsubProfile?.();
    };
  }, []);
}

export function useAuth() {
  return useAuthStore();
}
