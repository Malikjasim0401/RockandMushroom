import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

import { errorCode } from './errors';
import { auth } from './firebase';
import { isOffline, OFFLINE_MESSAGE } from './network';

export class DeleteAccountError extends Error {
  override name = 'DeleteAccountError';
}

const MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'That password is incorrect.',
  'auth/wrong-password': 'That password is incorrect.',
  'auth/missing-password': 'Enter your password.',
  'auth/too-many-requests': 'Too many attempts. Wait a moment and try again.',
  'auth/network-request-failed': OFFLINE_MESSAGE,
};

/**
 * Permanently deletes the signed-in account (App Store guideline 5.1.1(v), DECISIONS.md D21).
 * Re-authenticates first: Firebase requires a recent sign-in, and it confirms intent. Deleting
 * the Auth user fires the cleanupUser function, which removes every doc and photo; the session
 * then ends and the auth guard returns to sign-in.
 */
export async function deleteAccount(password: string): Promise<void> {
  const user = auth.currentUser;
  if (!user?.email) {
    throw new DeleteAccountError('You need to be signed in to delete your account.');
  }
  if (await isOffline()) throw new DeleteAccountError(OFFLINE_MESSAGE);

  try {
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
    await deleteUser(user);
  } catch (error) {
    const code = errorCode(error);
    throw new DeleteAccountError(
      (code && MESSAGES[code]) || "Couldn't delete your account. Please try again.",
    );
  }
}
