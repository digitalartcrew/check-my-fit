import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { db } from './utils/firestoreHelpers';

export const onRatingWritten = onDocumentWritten(
  { document: 'outfits/{outfitId}/ratings/{ratingUserId}', region: 'us-central1' },
  async (event) => {
    const outfitId = event.params.outfitId;
    const outfitRef = db.collection('outfits').doc(outfitId);

    // Re-aggregate all ratings for this outfit
    const ratingsSnap = await outfitRef.collection('ratings').get();
    const values = ratingsSnap.docs.map((d) => d.data().value as number);
    const count = values.length;
    const avg = count > 0 ? values.reduce((a, b) => a + b, 0) / count : 0;

    await outfitRef.update({
      ratingCount: count,
      averageRating: parseFloat(avg.toFixed(2)),
    });

    // Also update owner's stats
    const outfitSnap = await outfitRef.get();
    if (!outfitSnap.exists) return;

    const userId = outfitSnap.data()!.userId as string;

    // Recalculate owner's average across all their outfits
    const userOutfitsSnap = await db
      .collection('outfits')
      .where('userId', '==', userId)
      .get();

    let totalRatings = 0;
    let totalSum = 0;
    userOutfitsSnap.docs.forEach((d) => {
      const data = d.data();
      totalRatings += data.ratingCount ?? 0;
      totalSum += (data.averageRating ?? 0) * (data.ratingCount ?? 0);
    });

    const userAvg = totalRatings > 0 ? totalSum / totalRatings : 0;

    await db.collection('users').doc(userId).update({
      'stats.totalRatingsReceived': totalRatings,
      'stats.averageRatingReceived': parseFloat(userAvg.toFixed(2)),
    });
  }
);
