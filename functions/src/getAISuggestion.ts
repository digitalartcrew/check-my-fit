import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { db } from './utils/firestoreHelpers';
import { getAnthropicClient, buildOutfitPrompt } from './utils/anthropic';

const RATE_LIMIT_MS = 60 * 60 * 1000; // 1 hour
const MODEL = 'claude-opus-4-6';

interface RequestData {
  outfitId: string;
}

interface ResponseData {
  suggestion: string;
}

export const getAISuggestion = onCall<RequestData, Promise<ResponseData>>(
  { secrets: ['ANTHROPIC_API_KEY'], region: 'us-central1' },
  async (request) => {
    // 1. Auth check
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be signed in to generate suggestions.');
    }

    const { outfitId } = request.data;
    if (!outfitId || typeof outfitId !== 'string') {
      throw new HttpsError('invalid-argument', 'outfitId is required.');
    }

    // 2. Fetch outfit and verify ownership
    const outfitRef = db.collection('outfits').doc(outfitId);
    const outfitSnap = await outfitRef.get();

    if (!outfitSnap.exists) {
      throw new HttpsError('not-found', 'Outfit not found.');
    }

    const outfit = outfitSnap.data()!;

    if (outfit.userId !== request.auth.uid) {
      throw new HttpsError(
        'permission-denied',
        'Only the outfit owner can generate AI suggestions.'
      );
    }

    // 3. Rate limit check
    const suggestionRef = db.collection('aiSuggestions').doc(outfitId);
    const existingSnap = await suggestionRef.get();

    if (existingSnap.exists) {
      const lastGenerated = existingSnap.data()!.generatedAt as Timestamp;
      const msSince = Date.now() - lastGenerated.toMillis();
      if (msSince < RATE_LIMIT_MS) {
        const waitMins = Math.ceil((RATE_LIMIT_MS - msSince) / 60000);
        throw new HttpsError(
          'resource-exhausted',
          `Rate limit: please wait ${waitMins} more minute${waitMins !== 1 ? 's' : ''} before generating again.`
        );
      }
    }

    // 4. Fetch ratings and comments
    const [ratingsSnap, commentsSnap] = await Promise.all([
      outfitRef.collection('ratings').limit(20).get(),
      outfitRef.collection('comments').orderBy('createdAt', 'desc').limit(20).get(),
    ]);

    const ratings = ratingsSnap.docs.map((d) => d.data().value as number);
    const comments = commentsSnap.docs.map((d) => d.data().text as string);

    // 5. Build prompt
    const prompt = buildOutfitPrompt({
      caption: outfit.caption ?? '',
      averageRating: outfit.averageRating ?? 0,
      ratingCount: outfit.ratingCount ?? 0,
      ratings,
      comments,
      tags: outfit.tags ?? [],
    });

    // 6. Call Claude
    const anthropic = getAnthropicClient();
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const suggestionText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    // 7. Persist suggestion document
    await suggestionRef.set({
      outfitId,
      userId: outfit.userId,
      suggestion: suggestionText,
      promptSnapshot: prompt,
      generatedAt: FieldValue.serverTimestamp(),
      modelVersion: MODEL,
      ratingCountAtGeneration: outfit.ratingCount ?? 0,
      averageRatingAtGeneration: outfit.averageRating ?? 0,
    });

    // 8. Update outfit's last AI generation timestamp
    await outfitRef.update({
      aiSuggestionGeneratedAt: FieldValue.serverTimestamp(),
    });

    return { suggestion: suggestionText };
  }
);
