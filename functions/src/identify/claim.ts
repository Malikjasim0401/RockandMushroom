import { FieldValue, type Firestore, Timestamp } from 'firebase-admin/firestore';

import { DAILY_LIMIT, usagePath, usedToday, utcDay } from './rateLimit';
import { requestPath } from './request';

/** Requests delete themselves via the Firestore TTL policy on `expireAt` (DECISIONS.md D15). */
export const REQUEST_TTL_MS = 24 * 60 * 60 * 1000;

export type Claim =
  | { kind: 'claimed'; usedToday: number }
  | { kind: 'limit' }
  /** Already claimed: a duplicate event delivery. The first delivery owns the request. */
  | { kind: 'duplicate' };

/**
 * Atomically moves the request from `pending` to `processing` and charges one call against the
 * daily quota. Doing both in one transaction makes duplicate event deliveries free and exact:
 * only the delivery that sees `pending` is charged and does the work.
 */
export function claimRequest(
  db: Firestore,
  uid: string,
  requestId: string,
  now: Date = new Date(),
): Promise<Claim> {
  const requestRef = db.doc(requestPath(uid, requestId));
  const usageRef = db.doc(usagePath(uid));
  const today = utcDay(now);

  return db.runTransaction(async (tx) => {
    const [request, usage] = await tx.getAll(requestRef, usageRef);
    if (!request?.exists || request.get('status') !== 'pending') return { kind: 'duplicate' };

    tx.update(requestRef, {
      status: 'processing',
      startedAt: FieldValue.serverTimestamp(),
      expireAt: Timestamp.fromMillis(now.getTime() + REQUEST_TTL_MS),
    });

    const used = usedToday(usage?.data(), today);
    if (used >= DAILY_LIMIT) return { kind: 'limit' };

    tx.set(usageRef, { day: today, count: used + 1, updatedAt: FieldValue.serverTimestamp() });
    return { kind: 'claimed', usedToday: used + 1 };
  });
}
