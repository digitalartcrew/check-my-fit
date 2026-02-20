import { create } from 'zustand';
import type { User } from 'firebase/auth';
import type { UserProfile } from '@/types/user.types';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  hydrated: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  hydrated: false,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  setHydrated: (hydrated) => set({ hydrated }),
  reset: () => set({ user: null, profile: null, isLoading: false }),
}));
