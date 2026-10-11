import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { db } from './firebase';
import { type AuthUser } from './types';

/**
 * Creates `users/{uid}` if it doesn't exist yet. Runs after sign-up and sign-in, so a profile
 * write that failed once (offline, rules not deployed) heals on the next sign-in. Never throws:
 * a missing profile must not block authentication.
 */
export async function ensureUserProfile(user: AuthUser): Promise<void> {
  try {
    const ref = doc(db, 'rockmushroom', user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) return;
    await setDoc(ref, {
      displayName: user.displayName,
      email: user.email,
      createdAt: serverTimestamp(),
      speciesCount: 0,
    });
  } catch (error) {
    console.warn('Could not create user profile; will retry on next sign-in.', error);
  }
}
