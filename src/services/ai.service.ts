import { httpsCallable } from 'firebase/functions';
import { functions } from '@/config/firebase';

interface AISuggestionResponse {
  suggestion: string;
}

export async function callGetAISuggestion(outfitId: string): Promise<string> {
  const fn = httpsCallable<{ outfitId: string }, AISuggestionResponse>(
    functions,
    'getAISuggestion'
  );
  const result = await fn({ outfitId });
  return result.data.suggestion;
}
