import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { deleteObject, getBytes, ref, uploadBytes } from 'firebase/storage';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

import { hasEmulators, JPEG, PROJECT_ID } from './emulators';

const rules = (file: string) => readFileSync(resolve(__dirname, '../..', file), 'utf8');

describe.skipIf(!hasEmulators)('security rules', () => {
  let env: RulesTestEnvironment;

  beforeAll(async () => {
    env = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: { rules: rules('firestore.rules') },
      storage: { rules: rules('storage.rules') },
    });
  });

  beforeEach(async () => {
    await env.clearFirestore();
    await env.clearStorage();
  });

  afterAll(async () => {
    await env?.cleanup();
  });

  const alice = () => env.authenticatedContext('alice');
  const bob = () => env.authenticatedContext('bob');
  const guest = () => env.unauthenticatedContext();

  describe('Firestore', () => {
    const sighting = { species: 'American Goldfinch', scientificName: 'Spinus tristis' };

    it('lets a user manage their own profile, sightings and species', async () => {
      const db = alice().firestore();
      await assertSucceeds(setDoc(doc(db, 'users/alice'), { displayName: 'Alice' }));
      await assertSucceeds(getDoc(doc(db, 'users/alice')));
      await assertSucceeds(setDoc(doc(db, 'users/alice/sightings/s1'), sighting));
      await assertSucceeds(getDoc(doc(db, 'users/alice/sightings/s1')));
      await assertSucceeds(setDoc(doc(db, 'users/alice/species/spinus-tristis'), { n: 1 }));
      await assertSucceeds(deleteDoc(doc(db, 'users/alice/sightings/s1')));
    });

    it("blocks reading or writing another user's data", async () => {
      await env.withSecurityRulesDisabled(async (ctx) => {
        await setDoc(doc(ctx.firestore(), 'users/alice'), { displayName: 'Alice' });
        await setDoc(doc(ctx.firestore(), 'users/alice/sightings/s1'), sighting);
      });
      const db = bob().firestore();
      await assertFails(getDoc(doc(db, 'users/alice')));
      await assertFails(getDoc(doc(db, 'users/alice/sightings/s1')));
      await assertFails(setDoc(doc(db, 'users/alice/sightings/s2'), sighting));
      await assertFails(setDoc(doc(db, 'users/alice'), { speciesCount: 999 }));
    });

    it('blocks signed-out access', async () => {
      const db = guest().firestore();
      await assertFails(getDoc(doc(db, 'users/alice')));
      await assertFails(setDoc(doc(db, 'users/alice/sightings/s1'), sighting));
    });

    it('denies collections that are not allow-listed', async () => {
      await assertFails(setDoc(doc(alice().firestore(), 'users/alice/secrets/x'), { a: 1 }));
    });

    it('lets users read but never write their rate-limit counter', async () => {
      await env.withSecurityRulesDisabled(async (ctx) => {
        await setDoc(doc(ctx.firestore(), 'users/alice/meta/usage'), { day: 'x', count: 50 });
      });
      const db = alice().firestore();
      await assertSucceeds(getDoc(doc(db, 'users/alice/meta/usage')));
      await assertFails(setDoc(doc(db, 'users/alice/meta/usage'), { day: 'x', count: 0 }));
      await assertFails(deleteDoc(doc(db, 'users/alice/meta/usage')));
      await assertFails(setDoc(doc(db, 'users/alice/meta/other'), { a: 1 }));
      await assertFails(getDoc(doc(bob().firestore(), 'users/alice/meta/usage')));
    });

    describe('identification requests', () => {
      const path = 'users/alice/identifications/r1';
      const valid = () => ({
        imagePath: 'users/alice/uploads/r1.jpg',
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      it('lets the owner create a pending request for their own upload, read and delete it', async () => {
        const db = alice().firestore();
        await assertSucceeds(setDoc(doc(db, path), valid()));
        await assertSucceeds(getDoc(doc(db, path)));
        await assertSucceeds(deleteDoc(doc(db, path)));
      });

      it('rejects requests that are not exactly a fresh pending request', async () => {
        const db = alice().firestore();
        const r = doc(db, path);
        await assertFails(setDoc(r, { ...valid(), status: 'done' }));
        await assertFails(setDoc(r, { ...valid(), result: { isSpecimen: true } }));
        await assertFails(setDoc(r, { imagePath: valid().imagePath, status: 'pending' }));
        await assertFails(setDoc(r, { ...valid(), createdAt: new Date('2020-01-01') }));
      });

      it("rejects another request's upload, another user's upload, and traversal", async () => {
        const db = alice().firestore();
        const r = doc(db, path);
        await assertFails(setDoc(r, { ...valid(), imagePath: 'users/alice/uploads/r2.jpg' }));
        await assertFails(setDoc(r, { ...valid(), imagePath: 'users/bob/uploads/r1.jpg' }));
        await assertFails(
          setDoc(r, { ...valid(), imagePath: 'users/alice/uploads/../../bob/uploads/r1.jpg' }),
        );
      });

      it('never lets clients update a request (only the function writes outcomes)', async () => {
        const db = alice().firestore();
        await assertSucceeds(setDoc(doc(db, path), valid()));
        await assertFails(updateDoc(doc(db, path), { status: 'done' }));
      });

      it('blocks other users and signed-out clients', async () => {
        await assertFails(setDoc(doc(bob().firestore(), path), valid()));
        await assertFails(setDoc(doc(guest().firestore(), path), valid()));
        await assertSucceeds(setDoc(doc(alice().firestore(), path), valid()));
        await assertFails(getDoc(doc(bob().firestore(), path)));
        await assertFails(deleteDoc(doc(bob().firestore(), path)));
      });
    });
  });

  describe('Storage', () => {
    const jpeg = new Uint8Array(JPEG);
    const asJpeg = { contentType: 'image/jpeg' };

    it('lets a user upload, read and delete their own images', async () => {
      const storage = alice().storage();
      const upload = ref(storage, 'users/alice/uploads/u1.jpg');
      await assertSucceeds(uploadBytes(upload, jpeg, asJpeg));
      await assertSucceeds(getBytes(upload));
      await assertSucceeds(deleteObject(upload));
      await assertSucceeds(uploadBytes(ref(storage, 'users/alice/sightings/s1.jpg'), jpeg, asJpeg));
    });

    it("blocks another user's uploads and reads", async () => {
      await assertSucceeds(
        uploadBytes(ref(alice().storage(), 'users/alice/sightings/s1.jpg'), jpeg, asJpeg),
      );
      const storage = bob().storage();
      await assertFails(getBytes(ref(storage, 'users/alice/sightings/s1.jpg')));
      await assertFails(uploadBytes(ref(storage, 'users/alice/uploads/u1.jpg'), jpeg, asJpeg));
      await assertFails(deleteObject(ref(storage, 'users/alice/sightings/s1.jpg')));
    });

    it('blocks signed-out uploads', async () => {
      await assertFails(
        uploadBytes(ref(guest().storage(), 'users/alice/uploads/u1.jpg'), jpeg, asJpeg),
      );
    });

    it('rejects non-images and files of 5 MB or more', async () => {
      const storage = alice().storage();
      await assertFails(
        uploadBytes(ref(storage, 'users/alice/uploads/u1.jpg'), jpeg, {
          contentType: 'text/plain',
        }),
      );
      const big = new Uint8Array(5 * 1024 * 1024);
      await assertFails(uploadBytes(ref(storage, 'users/alice/uploads/u2.jpg'), big, asJpeg));
    });
  });
});
