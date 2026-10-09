import { useMemo, useSyncExternalStore } from 'react';

import { journal, type JournalState } from '@/lib/journal';
import { type Find, type SpecimenKind } from '@/lib/types';

export function useJournal(): JournalState {
  return useSyncExternalStore(journal.subscribe, journal.get);
}

export function useFind(id: string | undefined): {
  status: JournalState['status'];
  find: Find | undefined;
} {
  const { status, finds } = useJournal();
  const find = useMemo(() => finds.find((f) => f.id === id), [finds, id]);
  return { status, find };
}

export type KindFilter = 'all' | SpecimenKind;

/** Narrows finds to one kind, then to a case-insensitive match on common or scientific name. */
export function filterFinds(finds: Find[], search: string, kind: KindFilter = 'all'): Find[] {
  const q = search.trim().toLowerCase();
  return finds.filter(
    (f) =>
      (kind === 'all' || f.kind === kind) &&
      (!q || f.name.toLowerCase().includes(q) || f.scientificName.toLowerCase().includes(q)),
  );
}
