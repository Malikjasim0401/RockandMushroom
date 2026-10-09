import { ref, uploadBytes } from 'firebase/storage';

import { storage } from './firebase';

/** Uploads a local JPEG file to Storage. Storage rules require the image content type. */
export async function uploadJpeg(path: string, uri: string): Promise<void> {
  const blob = await (await fetch(uri)).blob();
  try {
    await uploadBytes(ref(storage, path), blob, { contentType: 'image/jpeg' });
  } finally {
    // React Native blobs hold native memory until closed.
    (blob as Blob & { close?: () => void }).close?.();
  }
}
