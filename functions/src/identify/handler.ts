import { type DocumentReference, FieldValue, getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { HttpsError } from 'firebase-functions/https';
import { logger } from 'firebase-functions/logger';

import { claimRequest } from './claim';
import { parseImagePath } from './imagePath';
import { type IdentifyImage } from './openai';
import { type IdentificationDoc, requestPath } from './request';

/** Same cap as storage.rules; also guards against files that bypassed the client resize. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** What the trigger passes in, so tests can drive the handler without Eventarc. */
export type IdentificationEvent = {
  uid: string;
  requestId: string;
  data: unknown;
};

const isJpeg = (buf: Buffer) =>
  buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;

const isNotFound = (error: unknown) =>
  typeof error === 'object' && error !== null && 'code' in error && error.code === 404;

/**
 * The app uploads the photo and creates the request at the same time, so the trigger can arrive
 * first. Storage objects only appear once fully written, so polling for one is safe.
 */
export const UPLOAD_WAIT_MS = 10_000;
const UPLOAD_POLL_MS = 250;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function downloadUpload(path: string, waitMs: number): Promise<Buffer> {
  const deadline = Date.now() + waitMs;
  let jpeg: Buffer | undefined;
  while (!jpeg) {
    try {
      [jpeg] = await getStorage().bucket().file(path).download();
    } catch (error) {
      if (!isNotFound(error)) throw error;
      if (Date.now() >= deadline) {
        throw new HttpsError(
          'not-found',
          'That photo is no longer available. Please take it again.',
        );
      }
      await sleep(UPLOAD_POLL_MS);
    }
  }
  if (jpeg.length > MAX_IMAGE_BYTES) {
    throw new HttpsError('invalid-argument', 'That photo is too large.');
  }
  if (!isJpeg(jpeg)) {
    throw new HttpsError('invalid-argument', 'That photo must be a JPEG.');
  }
  return jpeg;
}

async function deleteUpload(path: string) {
  try {
    await getStorage().bucket().file(path).delete({ ignoreNotFound: true });
  } catch (error) {
    // A leftover temp file costs pennies; never fail the request over it.
    logger.warn('Could not delete temp upload', { path, error });
  }
}

/** Maps any failure to the error stored on the request. Unexpected errors stay generic. */
function toRequestError(error: unknown, uid: string): IdentificationDoc['error'] {
  if (error instanceof HttpsError) return { code: error.code, message: error.message };
  logger.error('identifyBird failed', { uid, error });
  return { code: 'internal', message: 'Something went wrong. Please try again.' };
}

type Outcome = Pick<IdentificationDoc, 'status' | 'result' | 'error'>;

async function finish(ref: DocumentReference, outcome: Outcome) {
  try {
    await ref.update({ ...outcome, completedAt: FieldValue.serverTimestamp() });
  } catch (error) {
    // The user may have deleted the request (e.g. they left the screen); nothing to report to.
    logger.warn('Could not write identification outcome', { path: ref.path, error });
  }
}

/**
 * identifyBird, triggered by a new `users/{uid}/identifications/{requestId}` doc:
 * validate → claim + charge quota (one transaction) alongside the download → identify → write
 * the outcome → always delete the temp upload. Never throws: every outcome is written to the
 * request, and a thrown error would only make Eventarc log a failure the user can't see.
 */
export async function processIdentification(
  event: IdentificationEvent,
  identify: IdentifyImage,
  { uploadWaitMs = UPLOAD_WAIT_MS }: { uploadWaitMs?: number } = {},
): Promise<void> {
  const { uid, requestId } = event;
  const db = getFirestore();
  const ref = db.doc(requestPath(uid, requestId));
  const started = Date.now();

  // Validate before claiming, and never delete a file whose path failed validation.
  let imagePath: string;
  try {
    imagePath = parseImagePath(event.data, uid, requestId);
  } catch (error) {
    await finish(ref, { status: 'error', error: toRequestError(error, uid) });
    return;
  }

  // Claim and download run in parallel to save a round trip. A duplicate delivery discards its
  // download; only the delivery that wins the claim acts on it.
  const [claimed, downloaded] = await Promise.allSettled([
    claimRequest(db, uid, requestId),
    downloadUpload(imagePath, uploadWaitMs),
  ]);
  if (claimed.status === 'rejected') {
    await finish(ref, { status: 'error', error: toRequestError(claimed.reason, uid) });
    await deleteUpload(imagePath);
    return;
  }
  const claim = claimed.value;
  if (claim.kind === 'duplicate') return;

  try {
    if (claim.kind === 'limit') {
      throw new HttpsError('resource-exhausted', 'Daily limit reached, try tomorrow.');
    }
    if (downloaded.status === 'rejected') throw downloaded.reason;
    const result = await identify(downloaded.value);
    await finish(ref, { status: 'done', result });

    logger.info('identifyBird done', {
      uid,
      ms: Date.now() - started,
      usedToday: claim.usedToday,
      isSpecimen: result.isSpecimen,
      confidence: result.confidence,
    });
  } catch (error) {
    await finish(ref, { status: 'error', error: toRequestError(error, uid) });
  } finally {
    await deleteUpload(imagePath);
  }
}
