import {
  EDIBILITIES,
  type Edibility,
  KINDS,
  type SpecimenKind,
  type SpecimenTraits,
} from './types';

// Tolerant readers for data crossing the Firestore boundary: wrong types become empty values
// instead of crashing a screen.

export const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

export const str = (v: unknown) => (typeof v === 'string' ? v : '');

export const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

export function kind(v: unknown): SpecimenKind {
  return KINDS.find((k) => k === v) ?? 'rock';
}

/** Unknown or missing edibility on a mushroom must read as "unknown", never as safe. */
export function edibility(v: unknown, specimenKind: SpecimenKind): Edibility {
  if (specimenKind !== 'mushroom') return 'not_applicable';
  const found = EDIBILITIES.find((e) => e === v);
  return !found || found === 'not_applicable' ? 'unknown' : found;
}

export function traits(v: unknown): SpecimenTraits {
  const t = isRecord(v) ? v : {};
  return {
    rockType: str(t.rockType),
    hardness: str(t.hardness),
    luster: str(t.luster),
    color: str(t.color),
    streak: str(t.streak),
    composition: str(t.composition),
    cap: str(t.cap),
    stem: str(t.stem),
    gills: str(t.gills),
    sporePrint: str(t.sporePrint),
    habitat: str(t.habitat),
    region: str(t.region),
    season: str(t.season),
  };
}
