import { create } from 'zustand';
import type { DocumentSnapshot } from 'firebase/firestore';
import type { Outfit } from '@/types/outfit.types';

interface FeedState {
  outfits: Outfit[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
  isRefreshing: boolean;
  setOutfits: (outfits: Outfit[]) => void;
  appendOutfits: (outfits: Outfit[]) => void;
  setLastDoc: (doc: DocumentSnapshot | null) => void;
  setHasMore: (hasMore: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  reset: () => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  outfits: [],
  lastDoc: null,
  hasMore: true,
  isRefreshing: false,
  setOutfits: (outfits) => set({ outfits }),
  appendOutfits: (outfits) =>
    set((state) => ({ outfits: [...state.outfits, ...outfits] })),
  setLastDoc: (lastDoc) => set({ lastDoc }),
  setHasMore: (hasMore) => set({ hasMore }),
  setRefreshing: (isRefreshing) => set({ isRefreshing }),
  reset: () => set({ outfits: [], lastDoc: null, hasMore: true }),
}));
