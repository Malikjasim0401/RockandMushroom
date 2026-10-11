import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { logger } from 'firebase-functions/logger';

/**
 * Deletes everything a user owns: `users/{uid}` with every subcollection (sightings, species,
 * meta, identifications) and every Storage object under `users/{uid}/` (sighting photos and any
 * leftover uploads). Idempotent, so a retry after a partial failure finishes the job.
 */
export async function deleteUserData(uid: string): Promise<void> {
  const started = Date.now();
  await Promise.all([
    getFirestore().recursiveDelete(getFirestore().doc(`rockmushroom/${uid}`)),
    getStorage()
      .bucket()
      .deleteFiles({ prefix: `rockmushroom/${uid}/` }),
  ]);
  logger.info('User data deleted', { uid, ms: Date.now() - started });
}
