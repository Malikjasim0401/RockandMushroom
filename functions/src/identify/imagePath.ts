import { HttpsError } from 'firebase-functions/https';

// Upload names are client-generated UUIDs. A strict pattern rules out traversal ("..") and
// nested paths, which a plain prefix check would let through.
const FILE_NAME = /^[A-Za-z0-9_-]{1,64}\.jpg$/;

export const uploadPrefix = (uid: string) => `users/${uid}/uploads/`;
export const uploadPath = (uid: string, id: string) => `${uploadPrefix(uid)}${id}.jpg`;

/**
 * Validates a request's `imagePath`: it must be `users/{uid}/uploads/{requestId}.jpg`. Firestore
 * rules already enforce this on create; checking again keeps the function safe on its own.
 */
export function parseImagePath(data: unknown, uid: string, requestId: string): string {
  const imagePath =
    typeof data === 'object' && data !== null && 'imagePath' in data ? data.imagePath : undefined;

  if (typeof imagePath !== 'string' || imagePath.length === 0) {
    throw new HttpsError('invalid-argument', 'imagePath is required.');
  }

  const prefix = uploadPrefix(uid);
  if (!imagePath.startsWith(prefix)) {
    throw new HttpsError('permission-denied', 'You can only identify your own uploads.');
  }

  if (!FILE_NAME.test(imagePath.slice(prefix.length)) || imagePath !== uploadPath(uid, requestId)) {
    throw new HttpsError('invalid-argument', 'imagePath must be the upload for this request.');
  }

  return imagePath;
}
