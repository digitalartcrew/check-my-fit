import { useState, useCallback } from 'react';
import { useFeedStore } from '@/stores/feed.store';
import { fetchFeedPage } from '@/services/outfit.service';

export function useOutfits() {
  const {
    outfits,
    lastDoc,
    hasMore,
    isRefreshing,
    setOutfits,
    appendOutfits,
    setLastDoc,
    setHasMore,
    setRefreshing,
    reset,
  } = useFeedStore();

  const [isLoadingMore, setLoadingMore] = useState(false);
  const [isInitialLoading, setInitialLoading] = useState(outfits.length === 0);

  const loadInitial = useCallback(async () => {
    setInitialLoading(true);
    try {
      const { outfits: newOutfits, lastDoc: newLastDoc } = await fetchFeedPage(null);
      setOutfits(newOutfits);
      setLastDoc(newLastDoc);
      setHasMore(newOutfits.length === 12);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || isInitialLoading) return;
    setLoadingMore(true);
    try {
      const { outfits: newOutfits, lastDoc: newLastDoc } = await fetchFeedPage(lastDoc);
      appendOutfits(newOutfits);
      setLastDoc(newLastDoc);
      setHasMore(newOutfits.length === 12);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, lastDoc]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    reset();
    try {
      const { outfits: newOutfits, lastDoc: newLastDoc } = await fetchFeedPage(null);
      setOutfits(newOutfits);
      setLastDoc(newLastDoc);
      setHasMore(newOutfits.length === 12);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return {
    outfits,
    isInitialLoading,
    isLoadingMore,
    isRefreshing,
    hasMore,
    loadInitial,
    loadMore,
    refresh,
  };
}
