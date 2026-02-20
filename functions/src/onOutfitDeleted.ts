import { onDocumentDeleted } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import { db } from './utils/firestoreHelpers';

export const onOutfitDeleted = onDocumentDeleted(
  { document: 'outfits/{outfitId}', region: 'us-central1' },
  async (event) => {
    const outfit = event.data?.data();
    const outfitId = event.params.outfitId;

    // Delete Storage image
    if (outfit?.storagePath) {
      const bucket = admin.storage().bucket();
      await bucket.file(outfit.storagePath).delete().catch(() => {
        // File may already be deleted, ignore error
      });
    }

    // Delete AI suggestion document
    await db.collection('aiSuggestions').doc(outfitId).delete().catch(() => {});
  }
);
