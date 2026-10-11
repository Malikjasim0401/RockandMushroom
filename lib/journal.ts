import { collection, doc, onSnapshot, orderBy, query } from 'firebase/firestore';

import { db } from './firebase';
import { num } from './parse';
import { session } from './session';
import { parseFind } from './sightings';
import { type Find } from './types';

export type JournalState = {
  status: 'loading' | 'ready' | 'error';
  /** Newest first. */
  finds: Find[];
  /** Distinct specimens found. Stored as `speciesCount`: the field name predates the rebrand. */
  typeCount: number;
};

const initial = (): JournalState => ({ status: 'loading', finds: [], typeCount: 0 });

let state: JournalState = initial();
const listeners = new Set<() => void>();
let attachedUid: string | null = null;
let detach: (() => void) | null = null;

function update(patch: Partial<JournalState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function attach(uid: string) {
  const findsQuery = query(collection(db, 'rockmushroom', uid, 'sightings'), orderBy('seenAt', 'desc'));
  const stopFinds = onSnapshot(
    findsQuery,
    (snap) =>
      update({
        status: 'ready',
        finds: snap.docs.map(parseFind).filter((f): f is Find => f !== null),
      }),
    () => update({ status: 'error' }),
  );
  const stopProfile = onSnapshot(
    doc(db, 'rockmushroom', uid),
    (snap) => update({ typeCount: num(snap.get('speciesCount')) }),
    // A missing or unreadable profile just leaves the count at 0.
    () => {},
  );
  detach = () => {
    stopFinds();
    stopProfile();
  };
}

/** Follows the session: one pair of listeners for the signed-in user, none when signed out. */
function sync() {
  const s = session.get();
  const uid = s.status === 'signedIn' ? s.user.uid : null;
  if (uid === attachedUid) return;
  detach?.();
  detach = null;
  attachedUid = uid;
  state = initial();
  listeners.forEach((l) => l());
  if (uid) attach(uid);
}

session.subscribe(sync);
sync();

/**
 * App-wide live journal (DECISIONS.md D5): Home, Journal and Find detail share these two
 * listeners, so a save shows up everywhere immediately without refetching.
 */
export const journal = {
  get: (): JournalState => state,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
