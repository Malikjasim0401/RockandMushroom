import {
  collection,
  doc,
  type DocumentSnapshot,
  increment,
  runTransaction,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref } from 'firebase/storage';

import { db, storage } from './firebase';
import { isOffline, OFFLINE_MESSAGE } from './network';
import { edibility, kind, num, str, traits } from './parse';
import { type Find, type IdentifyResult, type Photo } from './types';
import { uploadJpeg } from './upload';

export const NOTES_MAX = 1000;

export class SaveError extends Error {
  override name = 'SaveError';
}

const sightingsPath = (uid: string) => `rockmushroom/${uid}/sightings`;

/**
 * Doc id for the distinct-specimen marker (DECISIONS.md D2): "Amanita muscaria" →
 * "amanita-muscaria". Anything that isn't a-z or 0-9 becomes "-" (ids can't contain "/").
 */
export function speciesKey(scientificName: string): string {
  const key = scientificName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return key || 'unknown';
}

/** Reads a find doc tolerantly. Pending server timestamps read as "now". */
export function parseFind(snap: DocumentSnapshot): Find | null {
  const d = snap.data({ serverTimestamps: 'estimate' });
  if (!d) return null;
  const seenAt = d.seenAt instanceof Timestamp ? d.seenAt.toDate() : new Date();
  const specimenKind = kind(d.kind);
  return {
    id: snap.id,
    kind: specimenKind,
    // `species` is what pre-rebrand docs called the name.
    name: str(d.name) || str(d.species),
    scientificName: str(d.scientificName),
    family: str(d.family),
    confidence: num(d.confidence),
    traits: traits(d.traits),
    edibility: edibility(d.edibility, specimenKind),
    safetyWarning: str(d.safetyWarning),
    summary: str(d.summary),
    funFact: str(d.funFact),
    photoPath: str(d.photoPath),
    photoUrl: str(d.photoUrl),
    notes: str(d.notes),
    seenAt,
  };
}

/**
 * Saves an identified specimen to the finds journal (brief: upload the photo, then write the doc):
 * 1. Upload the prepared photo to `users/{uid}/sightings/{id}.jpg` and resolve its URL.
 * 2. One transaction writes the sighting and, the first time this species is seen, the species
 *    marker plus `speciesCount + 1`. Race-free, so two quick saves can't double-count.
 * If the transaction fails, the uploaded photo is deleted so nothing is orphaned.
 */
export async function saveSighting(
  uid: string,
  result: IdentifyResult,
  photo: Photo,
): Promise<string> {
  if (await isOffline()) throw new SaveError(OFFLINE_MESSAGE);

  const sightingRef = doc(collection(db, sightingsPath(uid)));
  const photoPath = `${sightingsPath(uid)}/${sightingRef.id}.jpg`;
  const photoRef = ref(storage, photoPath);

  let photoUrl: string;
  try {
    await uploadJpeg(photoPath, photo.uri);
    photoUrl = await getDownloadURL(photoRef);
  } catch {
    deleteObject(photoRef).catch(() => {});
    throw new SaveError("Couldn't upload the photo. Check your connection and try again.");
  }

  const userRef = doc(db, 'rockmushroom', uid);
  const speciesRef = doc(db, 'rockmushroom', uid, 'species', speciesKey(result.scientificName));

  try {
    await runTransaction(db, async (tx) => {
      const marker = await tx.get(speciesRef);
      if (!marker.exists()) {
        tx.set(speciesRef, {
          scientificName: result.scientificName,
          name: result.name,
          kind: result.kind,
          firstSeenAt: serverTimestamp(),
        });
        // merge: the profile doc may not exist yet if its first write failed (it self-heals).
        tx.set(userRef, { speciesCount: increment(1) }, { merge: true });
      }
      tx.set(sightingRef, {
        kind: result.kind,
        name: result.name,
        scientificName: result.scientificName,
        family: result.family,
        confidence: result.confidence,
        traits: result.traits,
        edibility: result.edibility,
        safetyWarning: result.safetyWarning,
        summary: result.summary,
        funFact: result.funFact,
        photoPath,
        photoUrl,
        notes: '',
        seenAt: serverTimestamp(),
      });
    });
  } catch {
    deleteObject(photoRef).catch(() => {});
    throw new SaveError("Couldn't save to your finds. Please try again.");
  }

  return sightingRef.id;
}

/** Updates a sighting's notes (trimmed, capped at NOTES_MAX). */
export function updateNotes(uid: string, sightingId: string, notes: string): Promise<void> {
  return updateDoc(doc(db, sightingsPath(uid), sightingId), {
    notes: notes.trim().slice(0, NOTES_MAX),
  });
}
