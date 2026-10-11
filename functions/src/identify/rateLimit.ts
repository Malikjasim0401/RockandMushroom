export const DAILY_LIMIT = 50;

/** Calendar day in UTC, e.g. "2026-09-24". The counter resets when this changes. */
export const utcDay = (date: Date) => date.toISOString().slice(0, 10);

export const usagePath = (uid: string) => `rockmushroom/${uid}/meta/usage`;

type Usage = { day: string; count: number };

const isUsage = (v: unknown): v is Usage =>
  typeof v === 'object' &&
  v !== null &&
  typeof (v as Usage).day === 'string' &&
  typeof (v as Usage).count === 'number';

/** Calls already made today according to `users/{uid}/meta/usage`. */
export const usedToday = (usage: unknown, today: string) =>
  isUsage(usage) && usage.day === today ? usage.count : 0;
