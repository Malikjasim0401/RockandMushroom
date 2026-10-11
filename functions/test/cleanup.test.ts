import { deleteApp, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { deleteUserData } from '../src/account/cleanup';

import { BUCKET, hasEmulators, JPEG, PROJECT_ID } from './emulators';

describe.skipIf(!hasEmulators)('deleteUserData (emulators)', () => {
  const db = () => getFirestore();
  const bucket = () => getStorage().bucket();

  const seed = async (uid: string) => {
    await db().doc(`rockmushroom/${uid}`).set({ displayName: uid, speciesCount: 2 });
    await db().doc(`rockmushroom/${uid}/sightings/s1`).set({ species: 'Robin' });
    await db().doc(`rockmushroom/${uid}/species/turdus-migratorius`).set({ n: 1 });
    await db().doc(`rockmushroom/${uid}/meta/usage`).set({ day: 'x', count: 3 });
    await db().doc(`rockmushroom/${uid}/identifications/r1`).set({ status: 'done' });
    await bucket().file(`rockmushroom/${uid}/sightings/s1.jpg`).save(JPEG);
    await bucket().file(`rockmushroom/${uid}/uploads/u1.jpg`).save(JPEG);
  };

  const countDocs = async (uid: string) => {
    const paths = ['sightings', 'species', 'meta', 'identifications'];
    const sizes = await Promise.all(
      paths.map(async (p) => (await db().collection(`rockmushroom/${uid}/${p}`).get()).size),
    );
    const profile = (await db().doc(`rockmushroom/${uid}`).get()).exists ? 1 : 0;
    return profile + sizes.reduce((a, b) => a + b, 0);
  };
  const countFiles = async (uid: string) =>
    (await bucket().getFiles({ prefix: `rockmushroom/${uid}/` }))[0].length;

  beforeAll(() => {
    initializeApp({ projectId: PROJECT_ID, storageBucket: BUCKET });
  });

  afterAll(async () => {
    await Promise.all(getApps().map((app) => deleteApp(app)));
  });

  it("deletes every doc and file the user owns, and nobody else's", async () => {
    await Promise.all([seed('alice'), seed('bob')]);
    expect(await countDocs('alice')).toBe(5);
    expect(await countFiles('alice')).toBe(2);

    await deleteUserData('alice');

    expect(await countDocs('alice')).toBe(0);
    expect(await countFiles('alice')).toBe(0);
    expect(await countDocs('bob')).toBe(5);
    expect(await countFiles('bob')).toBe(2);
  });

  it('is idempotent: running again on an already-deleted user succeeds', async () => {
    await expect(deleteUserData('alice')).resolves.toBeUndefined();
    await expect(deleteUserData('nobody')).resolves.toBeUndefined();
  });
});
