import { KINDS, type Find, type SpecimenKind } from './types';

export type KindCounts = Record<SpecimenKind, number>;

export function countByKind(finds: readonly Find[]): KindCounts {
  const counts = Object.fromEntries(KINDS.map((k) => [k, 0])) as KindCounts;
  for (const find of finds) counts[find.kind] += 1;
  return counts;
}
