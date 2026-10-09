import { FirebaseError } from 'firebase/app';

const AUTH_MESSAGES: Record<string, string> = {
  'auth/invalid-email': "That email address doesn't look right.",
  'auth/missing-email': 'Enter your email address.',
  'auth/missing-password': 'Enter your password.',
  'auth/invalid-credential': 'Email or password is incorrect.',
  'auth/invalid-login-credentials': 'Email or password is incorrect.',
  'auth/wrong-password': 'Email or password is incorrect.',
  'auth/user-not-found': 'Email or password is incorrect.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/email-already-in-use': 'An account with this email already exists. Try signing in.',
  'auth/weak-password': 'Choose a stronger password.',
  'auth/too-many-requests': 'Too many attempts. Wait a moment and try again.',
  'auth/network-request-failed': "You're offline. Check your connection and try again.",
  'auth/operation-not-allowed': "Email sign-in isn't enabled for this app yet.",
  'auth/configuration-not-found': "Email sign-in isn't enabled for this app yet.",
};

const FALLBACK = 'Something went wrong. Please try again.';

export function errorCode(error: unknown): string | undefined {
  return error instanceof FirebaseError ? error.code : undefined;
}

/** Maps any thrown auth error to a message that is safe and friendly to show. */
export function authErrorMessage(error: unknown): string {
  const code = errorCode(error);
  return (code && AUTH_MESSAGES[code]) || FALLBACK;
}
