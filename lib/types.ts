import { type Timestamp } from 'firebase/firestore';

/** The signed-in user as the UI sees it: a plain snapshot, not the mutable Firebase User. */
export type AuthUser = {
  uid: string;
  email: string;
  displayName: string;
};

/** Firestore `users/{uid}`. */
export type UserProfile = {
  displayName: string;
  email: string;
  createdAt: Timestamp;
  speciesCount: number;
};

/** A local image with known dimensions. */
export type Photo = {
  uri: string;
  width: number;
  height: number;
};

// Identification types mirror functions/src/identify/{schema,request}.ts (DECISIONS.md D10).
// Keep both in sync.

export const KINDS = ['rock', 'mineral', 'mushroom'] as const;
export type SpecimenKind = (typeof KINDS)[number];

export const EDIBILITIES = [
  'not_applicable',
  'edible',
  'edible_with_caution',
  'inedible',
  'poisonous',
  'psychoactive',
  'deadly',
  'unknown',
] as const;
export type Edibility = (typeof EDIBILITIES)[number];

/** Every trait is a short string; the ones that don't apply to a kind are empty. */
export type SpecimenTraits = {
  rockType: string;
  hardness: string;
  luster: string;
  color: string;
  streak: string;
  composition: string;
  cap: string;
  stem: string;
  gills: string;
  sporePrint: string;
  habitat: string;
  region: string;
  season: string;
};

export type Alternative = {
  name: string;
  confidence: number;
};

export type IdentifyResult = {
  isSpecimen: boolean;
  kind: SpecimenKind;
  name: string;
  scientificName: string;
  family: string;
  /** 0–100 */
  confidence: number;
  traits: SpecimenTraits;
  edibility: Edibility;
  safetyWarning: string;
  summary: string;
  funFact: string;
  alternatives: Alternative[];
};

/** Firestore `users/{uid}/sightings/{id}`: one find in the journal (DECISIONS.md D19, D22). */
export type Find = {
  id: string;
  kind: SpecimenKind;
  name: string;
  scientificName: string;
  family: string;
  /** 0–100 */
  confidence: number;
  traits: SpecimenTraits;
  edibility: Edibility;
  safetyWarning: string;
  summary: string;
  funFact: string;
  photoPath: string;
  /** Download URL resolved at save time, so the grid needs no extra round trip per photo. */
  photoUrl: string;
  notes: string;
  seenAt: Date;
};
