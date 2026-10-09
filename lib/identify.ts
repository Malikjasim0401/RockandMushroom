import {
  collection,
  deleteDoc,
  doc,
  type DocumentReference,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import { db } from './firebase';
import { isOffline, OFFLINE_MESSAGE } from './network';
import { edibility, isRecord, kind, num, str, traits } from './parse';
import { type Alternative, type IdentifyResult, type Photo } from './types';
import { uploadJpeg } from './upload';

/** Upload + trigger + OpenAI normally take ~5 s; give slow networks room before giving up. */
export const IDENTIFY_TIMEOUT_MS = 30_000;

export type IdentifyPhase = 'uploading' | 'identifying';

export type IdentifyErrorCode = 'offline' | 'timeout' | 'limit' | 'failed' | 'aborted';

export class IdentifyError extends Error {
  constructor(
    readonly code: IdentifyErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'IdentifyError';
  }
}

const MESSAGES = {
  offline: OFFLINE_MESSAGE,
  timeout: 'Identification is taking too long. Please try again.',
  failed: 'Something went wrong. Please try again.',
} as const;

// ---- Boundary validation: the request doc is written by the function, so check its shape. ----

function parseResult(value: unknown): IdentifyResult | null {
  if (!isRecord(value) || typeof value.isSpecimen !== 'boolean') return null;
  const alternatives: Alternative[] = Array.isArray(value.alternatives)
    ? value.alternatives
        .filter(isRecord)
        .map((a) => ({ name: str(a.name), confidence: num(a.confidence) }))
        .filter((a) => a.name.length > 0)
    : [];
  const specimenKind = kind(value.kind);
  return {
    isSpecimen: value.isSpecimen,
    kind: specimenKind,
    name: str(value.name),
    scientificName: str(value.scientificName),
    family: str(value.family),
    confidence: num(value.confidence),
    traits: traits(value.traits),
    edibility: edibility(value.edibility, specimenKind),
    safetyWarning: str(value.safetyWarning),
    summary: str(value.summary),
    funFact: str(value.funFact),
    alternatives,
  };
}

function toRequestError(value: unknown): IdentifyError {
  const error = isRecord(value) ? value : {};
  const message = str(error.message) || MESSAGES.failed;
  return new IdentifyError(error.code === 'resource-exhausted' ? 'limit' : 'failed', message);
}

// ---- Steps ----

async function assertOnline() {
  if (await isOffline()) throw new IdentifyError('offline', MESSAGES.offline);
}

/** Resolves with the result, or rejects with an IdentifyError, as soon as the function answers. */
function waitForOutcome(
  requestRef: DocumentReference,
  signal: AbortSignal,
): Promise<IdentifyResult> {
  return new Promise((resolve, reject) => {
    let unsubscribe = () => {};
    const settle = (fn: () => void) => {
      clearTimeout(timer);
      unsubscribe();
      signal.removeEventListener('abort', onAbort);
      fn();
    };
    const onAbort = () => settle(() => reject(new IdentifyError('aborted', 'Cancelled')));
    const timer = setTimeout(
      () => settle(() => reject(new IdentifyError('timeout', MESSAGES.timeout))),
      IDENTIFY_TIMEOUT_MS,
    );
    signal.addEventListener('abort', onAbort);

    unsubscribe = onSnapshot(
      requestRef,
      (snap) => {
        const data = snap.data();
        if (data?.status === 'done') {
          const result = parseResult(data.result);
          settle(() =>
            result ? resolve(result) : reject(new IdentifyError('failed', MESSAGES.failed)),
          );
        } else if (data?.status === 'error') {
          settle(() => reject(toRequestError(data.error)));
        }
      },
      () => settle(() => reject(new IdentifyError('failed', MESSAGES.failed))),
    );
  });
}

type IdentifyOptions = {
  signal: AbortSignal;
  onPhase?: (phase: IdentifyPhase) => void;
};

/**
 * Identifies a prepared photo through the identifyBird trigger (the function keeps its name, D22) (DECISIONS.md D15, D18):
 * the upload and the request go out in parallel, then the request doc is watched until the
 * function writes `done` or `error`. The request is deleted afterwards; TTL is the backstop.
 */
export async function identifyPhoto(
  uid: string,
  photo: Photo,
  { signal, onPhase }: IdentifyOptions,
): Promise<IdentifyResult> {
  await assertOnline();

  const requestRef = doc(collection(db, 'users', uid, 'identifications'));
  const imagePath = `users/${uid}/uploads/${requestRef.id}.jpg`;
  // Our own controller also stops the listener if the upload fails first.
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal.addEventListener('abort', abort);

  onPhase?.('uploading');
  try {
    const outcome = waitForOutcome(requestRef, controller.signal);
    const [, , result] = await Promise.all([
      uploadJpeg(imagePath, photo.uri).then(() => onPhase?.('identifying')),
      setDoc(requestRef, { imagePath, status: 'pending', createdAt: serverTimestamp() }),
      outcome,
    ]);
    return result;
  } catch (error) {
    if (error instanceof IdentifyError) throw error;
    throw new IdentifyError('failed', MESSAGES.failed);
  } finally {
    signal.removeEventListener('abort', abort);
    controller.abort();
    deleteDoc(requestRef).catch(() => {});
  }
}
