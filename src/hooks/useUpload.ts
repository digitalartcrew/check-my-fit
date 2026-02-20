import { useState } from 'react';
import { uploadOutfitImage } from '@/services/storage.service';

export function useUpload() {
  const [progress, setProgress] = useState(0);
  const [isUploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(
    userId: string,
    uri: string
  ): Promise<{ imageUrl: string; storagePath: string } | null> {
    setUploading(true);
    setError(null);
    setProgress(0);
    try {
      const result = await uploadOutfitImage(userId, uri, setProgress);
      return result;
    } catch (e: any) {
      setError(e.message ?? 'Upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  }

  return { upload, progress, isUploading, error };
}
