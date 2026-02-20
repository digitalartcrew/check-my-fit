import { useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { callGetAISuggestion } from '@/services/ai.service';
import { COLLECTIONS, LIMITS } from '@/config/constants';
import type { AISuggestion } from '@/types/outfit.types';

export function useAISuggestion(outfitId: string) {
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitMinutes, setRateLimitMinutes] = useState<number | null>(null);

  async function loadExistingSuggestion() {
    const snap = await getDoc(doc(db, COLLECTIONS.AI_SUGGESTIONS, outfitId));
    if (snap.exists()) {
      setSuggestion({ outfitId: snap.id, ...snap.data() } as AISuggestion);
    }
  }

  async function generate() {
    setLoading(true);
    setError(null);
    setRateLimitMinutes(null);
    try {
      const text = await callGetAISuggestion(outfitId);
      // Reload the full suggestion document from Firestore
      await loadExistingSuggestion();
      return text;
    } catch (e: any) {
      const msg: string = e.message ?? '';
      if (msg.includes('Rate limit') || e.code === 'resource-exhausted') {
        const match = msg.match(/(\d+) more minute/);
        setRateLimitMinutes(match ? parseInt(match[1]) : 60);
        setError(msg);
      } else {
        setError(msg || 'Failed to generate suggestion');
      }
    } finally {
      setLoading(false);
    }
  }

  return {
    suggestion,
    isLoading,
    error,
    rateLimitMinutes,
    loadExistingSuggestion,
    generate,
  };
}
