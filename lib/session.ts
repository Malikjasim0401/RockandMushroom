import { onAuthStateChanged, type User } from 'firebase/auth';

import { auth } from './firebase';
import { type AuthUser } from './types';

export type AuthState =
  { status: 'loading' } | { status: 'signedOut' } | { status: 'signedIn'; user: AuthUser };

const toState = (user: User | null): AuthState =>
  user
    ? {
        status: 'signedIn',
        user: { uid: user.uid, email: user.email ?? '', displayName: user.displayName ?? '' },
      }
    : { status: 'signedOut' };

let current: AuthState = { status: 'loading' };
// Kept after sign-out so screens that are mid-exit still render a user instead of crashing.
let lastUser: AuthUser | null = null;
const listeners = new Set<() => void>();

function emit(next: AuthState) {
  current = next;
  if (next.status === 'signedIn') lastUser = next.user;
  listeners.forEach((listener) => listener());
}

// One app-wide listener. Firebase restores the persisted session, then reports it here.
onAuthStateChanged(auth, (user) => emit(toState(user)));

/** External store for useSyncExternalStore: only subscribers re-render on auth changes. */
export const session = {
  get: (): AuthState => current,
  getLastUser: (): AuthUser | null => lastUser,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  /** Re-reads the current user, e.g. after updateProfile, which fires no auth event. */
  refresh() {
    emit(toState(auth.currentUser));
  },
};
