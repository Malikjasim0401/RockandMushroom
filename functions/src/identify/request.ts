import { type FunctionsErrorCode } from 'firebase-functions/https';

import { type IdentifyResult } from './schema';

// The app mirrors these in lib/types.ts (docs/DECISIONS.md D10, D15). Keep both in sync.

/** pending (client) → processing (claimed) → done | error (function). */
export type IdentificationStatus = 'pending' | 'processing' | 'done' | 'error';

export type IdentificationError = {
  code: FunctionsErrorCode;
  message: string;
};

/** `users/{uid}/identifications/{requestId}`, where requestId is the upload's id. */
export type IdentificationDoc = {
  imagePath: string;
  status: IdentificationStatus;
  result?: IdentifyResult;
  error?: IdentificationError;
};

export const requestPath = (uid: string, requestId: string) =>
  `rockmushroom/${uid}/identifications/${requestId}`;
