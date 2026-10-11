import { deleteApp, getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { HttpsError } from 'firebase-functions/https';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { REQUEST_TTL_MS } from '../src/identify/claim';
import { processIdentification } from '../src/identify/handler';
import { uploadPath } from '../src/identify/imagePath';
import { type IdentifyImage } from '../src/identify/openai';
import { DAILY_LIMIT, usagePath, utcDay } from '../src/identify/rateLimit';
import { requestPath } from '../src/identify/request';
import { type IdentifyResult, NO_SPECIMEN } from '../src/identify/schema';

import { BUCKET, hasEmulators, JPEG, PROJECT_ID } from './emulators';

const RESULT: IdentifyResult = {
  ...NO_SPECIMEN,
  isSpecimen: true,
  kind: 'mineral',
  name: 'Amethyst',
  scientificName: 'Quartz var. amethyst',
  family: 'Silicate',
  confidence: 97,
};

// Drives the handler exactly as the trigger does. The Functions emulator isn't started for this
// suite, so no real trigger races the test.
describe.skipIf(!hasEmulators)('processIdentification (emulators)', () => {
  const uid = 'alice';
  const db = () => getFirestore();
  const bucket = () => getStorage().bucket();

  const upload = (id: string, bytes: Buffer = JPEG) =>
    bucket().file(uploadPath(uid, id)).save(bytes, { contentType: 'image/jpeg' });
  const uploadExists = async (path: string) => (await bucket().file(path).exists())[0];

  /** Creates a request the way the app does, then runs the handler on it. */
  const request = async (id: string, imagePath = uploadPath(uid, id)) => {
    const data = { imagePath, status: 'pending', createdAt: FieldValue.serverTimestamp() };
    await db().doc(requestPath(uid, id)).set(data);
    return { uid, requestId: id, data };
  };
  const readRequest = async (id: string) => (await db().doc(requestPath(uid, id)).get()).data();
  const usage = async () => (await db().doc(usagePath(uid)).get()).data();
  const setUsage = (day: string, count: number) => db().doc(usagePath(uid)).set({ day, count });

  let identify: ReturnType<typeof vi.fn<IdentifyImage>>;

  beforeAll(() => {
    initializeApp({ projectId: PROJECT_ID, storageBucket: BUCKET });
  });

  afterAll(async () => {
    await Promise.all(getApps().map((app) => deleteApp(app)));
  });

  beforeEach(async () => {
    identify = vi.fn<IdentifyImage>().mockResolvedValue(RESULT);
    await db().recursiveDelete(db().doc(`rockmushroom/${uid}`));
    await bucket().deleteFiles({ prefix: 'rockmushroom/' });
  });

  it('identifies, stores the result, counts the call and deletes the upload', async () => {
    await upload('r1');
    const before = Date.now();
    await processIdentification(await request('r1'), identify);

    const doc = await readRequest('r1');
    expect(doc).toMatchObject({ status: 'done', result: RESULT });
    expect(doc?.error).toBeUndefined();
    expect(doc?.completedAt).toBeDefined();
    expect(doc?.expireAt.toMillis()).toBeGreaterThanOrEqual(before + REQUEST_TTL_MS - 1000);
    expect(identify).toHaveBeenCalledWith(JPEG);
    expect(await uploadExists(uploadPath(uid, 'r1'))).toBe(false);
    expect(await usage()).toMatchObject({ day: utcDay(new Date()), count: 1 });
  });

  it('ignores a duplicate delivery: no second charge, no second OpenAI call', async () => {
    await upload('r1');
    const event = await request('r1');
    await processIdentification(event, identify);
    await processIdentification(event, identify);
    expect(identify).toHaveBeenCalledTimes(1);
    expect(await usage()).toMatchObject({ count: 1 });
    expect(await readRequest('r1')).toMatchObject({ status: 'done' });
  });

  it('handles concurrent duplicate deliveries exactly once (transactional claim)', async () => {
    await upload('r1');
    const event = await request('r1');
    await Promise.all([1, 2, 3].map(() => processIdentification(event, identify)));
    expect(identify).toHaveBeenCalledTimes(1);
    expect(await usage()).toMatchObject({ count: 1 });
  });

  it('records errors from identification and still deletes the upload', async () => {
    await upload('r1');
    identify.mockRejectedValue(new HttpsError('unavailable', 'Bird ID is busy right now.'));
    await processIdentification(await request('r1'), identify);
    expect(await readRequest('r1')).toMatchObject({
      status: 'error',
      error: { code: 'unavailable', message: 'Bird ID is busy right now.' },
    });
    expect(await uploadExists(uploadPath(uid, 'r1'))).toBe(false);
  });

  it('hides unexpected errors behind a generic internal error', async () => {
    await upload('r1');
    identify.mockRejectedValue(new Error('boom: secret detail'));
    await processIdentification(await request('r1'), identify);
    const doc = await readRequest('r1');
    expect(doc).toMatchObject({ status: 'error', error: { code: 'internal' } });
    expect(doc?.error.message).not.toContain('secret');
  });

  it('reports a missing upload as not-found', async () => {
    await processIdentification(await request('gone'), identify, { uploadWaitMs: 0 });
    expect(await readRequest('gone')).toMatchObject({
      status: 'error',
      error: { code: 'not-found' },
    });
  });

  it('waits for an upload that lands after the request (app uploads in parallel)', async () => {
    const event = await request('late');
    const late = new Promise((resolve) => setTimeout(resolve, 1200)).then(() => upload('late'));
    await Promise.all([processIdentification(event, identify), late]);
    expect(await readRequest('late')).toMatchObject({ status: 'done', result: RESULT });
    expect(await uploadExists(uploadPath(uid, 'late'))).toBe(false);
  });

  it('rejects non-JPEG files and deletes them', async () => {
    await upload('r1', Buffer.from('not a jpeg'));
    await processIdentification(await request('r1'), identify);
    expect(await readRequest('r1')).toMatchObject({ error: { code: 'invalid-argument' } });
    expect(await uploadExists(uploadPath(uid, 'r1'))).toBe(false);
    expect(identify).not.toHaveBeenCalled();
  });

  it("refuses a path outside the user's uploads and never deletes that file", async () => {
    const bobFile = uploadPath('bob', 'r1');
    await bucket().file(bobFile).save(JPEG, { contentType: 'image/jpeg' });
    // Rules block this create; the function must hold the line on its own too.
    await processIdentification(await request('r1', bobFile), identify);
    expect(await readRequest('r1')).toMatchObject({ error: { code: 'permission-denied' } });
    expect(await uploadExists(bobFile)).toBe(true);
    expect(await usage()).toBeUndefined();
    expect(identify).not.toHaveBeenCalled();
  });

  it(`stops call ${DAILY_LIMIT + 1} of the day with resource-exhausted`, async () => {
    await setUsage(utcDay(new Date()), DAILY_LIMIT - 1);
    await upload('a');
    await processIdentification(await request('a'), identify);
    expect(await readRequest('a')).toMatchObject({ status: 'done' });

    await upload('b');
    await processIdentification(await request('b'), identify);
    expect(await readRequest('b')).toMatchObject({
      status: 'error',
      error: { code: 'resource-exhausted', message: 'Daily limit reached, try tomorrow.' },
    });
    expect(await uploadExists(uploadPath(uid, 'b'))).toBe(false);
    expect(identify).toHaveBeenCalledTimes(1);
    expect(await usage()).toMatchObject({ count: DAILY_LIMIT });
  });

  it('resets the counter on a new UTC day', async () => {
    await setUsage('2000-01-01', DAILY_LIMIT);
    await upload('r1');
    await processIdentification(await request('r1'), identify);
    expect(await readRequest('r1')).toMatchObject({ status: 'done' });
    expect(await usage()).toMatchObject({ day: utcDay(new Date()), count: 1 });
  });

  it('counts concurrent requests exactly', async () => {
    const ids = ['c1', 'c2', 'c3', 'c4', 'c5'];
    await Promise.all(ids.map((id) => upload(id)));
    const events = await Promise.all(ids.map((id) => request(id)));
    await Promise.all(events.map((e) => processIdentification(e, identify)));
    expect(await usage()).toMatchObject({ count: ids.length });
  });

  it('survives the user deleting the request mid-flight', async () => {
    await upload('r1');
    const event = await request('r1');
    identify.mockImplementation(async () => {
      await db().doc(requestPath(uid, 'r1')).delete();
      return RESULT;
    });
    await expect(processIdentification(event, identify)).resolves.toBeUndefined();
    expect(await uploadExists(uploadPath(uid, 'r1'))).toBe(false);
  });
});
