import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/config/firebase';

export async function uploadOutfitImage(
  userId: string,
  uri: string,
  onProgress?: (progress: number) => void
): Promise<{ imageUrl: string; storagePath: string }> {
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
  const storagePath = `outfits/${userId}/${filename}`;
  const storageRef = ref(storage, storagePath);

  const response = await fetch(uri);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, blob, {
      contentType: 'image/jpeg',
    });

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = snapshot.bytesTransferred / snapshot.totalBytes;
        onProgress?.(progress);
      },
      reject,
      async () => {
        const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({ imageUrl, storagePath });
      }
    );
  });
}

export async function uploadAvatarImage(
  userId: string,
  uri: string
): Promise<string> {
  const storagePath = `avatars/${userId}/avatar.jpg`;
  const storageRef = ref(storage, storagePath);

  const response = await fetch(uri);
  const blob = await response.blob();

  await uploadBytesResumable(storageRef, blob, { contentType: 'image/jpeg' });
  return await getDownloadURL(storageRef);
}

export async function deleteStorageFile(storagePath: string): Promise<void> {
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);
}
