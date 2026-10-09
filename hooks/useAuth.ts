import { useSyncExternalStore } from 'react';

import { type AuthState, session } from '@/lib/session';
import { type AuthUser } from '@/lib/types';

const NO_USER: AuthUser = { uid: '', email: '', displayName: '' };

export function useAuth(): AuthState {
  return useSyncExternalStore(session.subscribe, session.get);
}

/**
 * The signed-in user, for screens behind the auth guard. During the sign-out transition it
 * keeps returning the last user so exiting screens don't flash or crash.
 */
export function useUser(): AuthUser {
  return useSyncExternalStore(session.subscribe, session.getLastUser) ?? NO_USER;
}
