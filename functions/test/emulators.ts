/** Emulator-backed suites run only under `npm run test:emulators` (firebase emulators:exec). */
export const hasEmulators = Boolean(
  process.env.FIRESTORE_EMULATOR_HOST && process.env.FIREBASE_STORAGE_EMULATOR_HOST,
);

export const PROJECT_ID = 'demo-rockandmushroom';
export const BUCKET = `${PROJECT_ID}.appspot.com`;

/** Smallest byte sequence that passes the JPEG magic-number check. */
export const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
