import { type IconName } from '@/components/ui';
import { type Edibility, type SpecimenKind, type SpecimenTraits } from '@/lib/types';

type BadgeTone = 'forest' | 'slate' | 'amber';

export const KIND_META: Record<SpecimenKind, { label: string; icon: IconName; tone: BadgeTone }> = {
  rock: { label: 'Rock', icon: 'rock', tone: 'slate' },
  mineral: { label: 'Mineral', icon: 'mineral', tone: 'amber' },
  mushroom: { label: 'Mushroom', icon: 'mushroom', tone: 'forest' },
};

type TraitDef = { key: keyof SpecimenTraits; label: string; icon: IconName };

const ROCK_TRAITS: TraitDef[] = [
  { key: 'rockType', label: 'Type', icon: 'layers' },
  { key: 'hardness', label: 'Mohs hardness', icon: 'hardness' },
  { key: 'luster', label: 'Luster', icon: 'luster' },
  { key: 'color', label: 'Color', icon: 'palette' },
  { key: 'streak', label: 'Streak', icon: 'streak' },
  { key: 'composition', label: 'Composition', icon: 'composition' },
  { key: 'habitat', label: 'Forms in', icon: 'habitat' },
  { key: 'region', label: 'Found in', icon: 'region' },
];

const MUSHROOM_TRAITS: TraitDef[] = [
  { key: 'cap', label: 'Cap', icon: 'cap' },
  { key: 'stem', label: 'Stem', icon: 'stem' },
  { key: 'gills', label: 'Gills', icon: 'gills' },
  { key: 'sporePrint', label: 'Spore print', icon: 'spore' },
  { key: 'color', label: 'Color', icon: 'palette' },
  { key: 'habitat', label: 'Habitat', icon: 'habitat' },
  { key: 'region', label: 'Region', icon: 'region' },
  { key: 'season', label: 'Season', icon: 'calendar' },
];

export type TraitGroup = 'features' | 'habitat';

const isHabitat = (key: keyof SpecimenTraits) =>
  key === 'habitat' || key === 'region' || key === 'season';

/** The traits for a kind, optionally narrowed to the physical features or the habitat. */
export const traitDefs = (kind: SpecimenKind, group?: TraitGroup): TraitDef[] =>
  (kind === 'mushroom' ? MUSHROOM_TRAITS : ROCK_TRAITS).filter(
    (t) => !group || (group === 'habitat') === isHabitat(t.key),
  );

export const EDIBILITY_META: Record<
  Exclude<Edibility, 'not_applicable'>,
  { label: string; icon: IconName; danger: boolean }
> = {
  edible: { label: 'Edible', icon: 'shield', danger: false },
  edible_with_caution: { label: 'Edible, with caution', icon: 'warning', danger: false },
  inedible: { label: 'Not edible', icon: 'warning', danger: false },
  poisonous: { label: 'Poisonous', icon: 'skull', danger: true },
  psychoactive: { label: 'Psychoactive', icon: 'warning', danger: true },
  deadly: { label: 'Deadly poisonous', icon: 'skull', danger: true },
  unknown: { label: 'Edibility unknown', icon: 'warning', danger: false },
};

/** The traits of a kind that actually have a value. */
export const filledTraits = (kind: SpecimenKind, traits: SpecimenTraits, group?: TraitGroup) =>
  traitDefs(kind, group).filter((t) => traits[t.key].length > 0);

/** Shown on every mushroom, whatever the model says. */
export const MUSHROOM_DISCLAIMER =
  'Never eat a wild mushroom based on this app. Always have a local expert confirm it first.';
