import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';

import { auth } from './firebase';
import { session } from './session';
import { ensureUserProfile } from './users';

const normalizeEmail = (email: string) => email.trim();

export async function signUp(name: string, email: string, password: string): Promise<void> {
  const displayName = name.trim();
  const { user } = await createUserWithEmailAndPassword(auth, normalizeEmail(email), password);
  try {
    await updateProfile(user, { displayName });
    session.refresh();
  } catch (error) {
    // The account exists at this point; a missing display name must not fail sign-up.
    console.warn('Could not set display name.', error);
  }
  await ensureUserProfile({ uid: user.uid, email: user.email ?? '', displayName });
}

export async function signIn(email: string, password: string): Promise<void> {
  const { user } = await signInWithEmailAndPassword(auth, normalizeEmail(email), password);
  // Not awaited: the profile check must not delay reaching Home.
  void ensureUserProfile({
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? '',
  });
}

export function signOut(): Promise<void> {
  return firebaseSignOut(auth);
}

export function sendPasswordReset(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, normalizeEmail(email));
}
