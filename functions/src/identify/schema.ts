// The app mirrors these types in lib/types.ts (docs/DECISIONS.md D10, D22). Keep both in sync.

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
  // Rocks and minerals
  rockType: string;
  hardness: string;
  luster: string;
  color: string;
  streak: string;
  composition: string;
  // Mushrooms
  cap: string;
  stem: string;
  gills: string;
  sporePrint: string;
  // All kinds
  habitat: string;
  region: string;
  /** Mushrooms: when they typically fruit. Empty for rocks and minerals. */
  season: string;
};

export const TRAIT_KEYS = [
  'rockType',
  'hardness',
  'luster',
  'color',
  'streak',
  'composition',
  'cap',
  'stem',
  'gills',
  'sporePrint',
  'habitat',
  'region',
  'season',
] as const satisfies readonly (keyof SpecimenTraits)[];

export type Alternative = {
  name: string;
  confidence: number;
};

export type IdentifyResult = {
  isSpecimen: boolean;
  kind: SpecimenKind;
  /** Common name, e.g. "Amethyst" or "Fly Agaric". */
  name: string;
  /** Binomial for fungi; mineral species or rock classification for the rest. */
  scientificName: string;
  /** Fungal family, mineral class, or rock class (igneous, sedimentary, metamorphic). */
  family: string;
  /** 0–100 */
  confidence: number;
  traits: SpecimenTraits;
  edibility: Edibility;
  /** Mushrooms only: the specific danger, look-alikes and what to do. */
  safetyWarning: string;
  summary: string;
  /** One surprising, true detail about this kind of specimen. */
  funFact: string;
  alternatives: Alternative[];
};

export const MAX_ALTERNATIVES = 2;

const EMPTY_TRAITS: SpecimenTraits = {
  rockType: '',
  hardness: '',
  luster: '',
  color: '',
  streak: '',
  composition: '',
  cap: '',
  stem: '',
  gills: '',
  sporePrint: '',
  habitat: '',
  region: '',
  season: '',
};

export const NO_SPECIMEN: IdentifyResult = {
  isSpecimen: false,
  kind: 'rock',
  name: '',
  scientificName: '',
  family: '',
  confidence: 0,
  traits: EMPTY_TRAITS,
  edibility: 'not_applicable',
  safetyWarning: '',
  summary: '',
  funFact: '',
  alternatives: [],
};

const text = (description: string) => ({ type: 'string', description }) as const;
const score = (description: string) => ({ type: 'integer', description }) as const;

/**
 * Structured Outputs schema (strict). Strict mode requires every property to be listed in
 * `required` and `additionalProperties: false` at every level.
 */
export const IDENTIFY_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'isSpecimen',
    'kind',
    'name',
    'scientificName',
    'family',
    'confidence',
    'traits',
    'edibility',
    'safetyWarning',
    'summary',
    'funFact',
    'alternatives',
  ],
  properties: {
    isSpecimen: {
      type: 'boolean',
      description: 'True only if a real rock, mineral or mushroom/fungus is visible.',
    },
    kind: {
      type: 'string',
      enum: [...KINDS],
      description:
        'rock = multi-mineral rock (granite, basalt); mineral = a single mineral or crystal; mushroom = any fungus.',
    },
    name: text('Common English name, e.g. "Amethyst", "Granite" or "Fly Agaric".'),
    scientificName: text(
      'Mushroom: binomial, e.g. "Amanita muscaria". Mineral: mineral species, e.g. "Quartz var. amethyst". Rock: formal rock name, e.g. "Biotite granite".',
    ),
    family: text(
      'Mushroom: fungal family, e.g. "Amanitaceae". Mineral: mineral class, e.g. "Silicate". Rock: igneous, sedimentary or metamorphic.',
    ),
    confidence: score('Honest 0-100 estimate that the identification is correct.'),
    traits: {
      type: 'object',
      additionalProperties: false,
      required: [...TRAIT_KEYS],
      properties: {
        rockType: text(
          'Rocks and minerals: igneous, sedimentary, metamorphic or "mineral". Else "".',
        ),
        hardness: text('Rocks and minerals: Mohs hardness, e.g. "7" or "6–6.5". Else "".'),
        luster: text('Rocks and minerals: e.g. "Vitreous", "Metallic", "Dull". Else "".'),
        color: text('Main colors, 1–4 words.'),
        streak: text('Minerals: streak color, e.g. "White". Else "".'),
        composition: text(
          'Rocks and minerals: chemical formula or main minerals, e.g. "SiO₂". Else "".',
        ),
        cap: text('Mushrooms: cap shape, size and surface, 2–8 words. Else "".'),
        stem: text('Mushrooms: stem and ring or volva, 2–8 words. Else "".'),
        gills: text('Mushrooms: gills, pores or teeth under the cap, 1–6 words. Else "".'),
        sporePrint: text('Mushrooms: spore print color, e.g. "White". Else "".'),
        habitat: text('Where it forms or grows, 1–5 words, e.g. "Volcanic geodes".'),
        region: text('Where it is commonly found, e.g. "Brazil, Uruguay".'),
        season: text(
          'Mushrooms: when it usually fruits, e.g. \"Late summer to autumn\". Else \"\".',
        ),
      },
    },
    edibility: {
      type: 'string',
      enum: [...EDIBILITIES],
      description:
        'Mushrooms only; "not_applicable" for rocks and minerals. When unsure, use "unknown", and never "edible" for a look-alike risk without "edible_with_caution".',
    },
    safetyWarning: text(
      'Mushrooms: one or two sentences naming the main danger, deadly look-alikes, and that it must not be eaten without an expert. Rocks and minerals: a real hazard only (asbestos, toxic or radioactive minerals), else "".',
    ),
    summary: text('2–3 friendly sentences on appearance, formation or ecology. No markdown.'),
    funFact: text(
      'One surprising, accurate fact about this specimen in a single sentence. No markdown.',
    ),
    alternatives: {
      type: 'array',
      description: 'Up to 2 other likely identifications, most likely first.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'confidence'],
        properties: {
          name: text('Common English name.'),
          confidence: score('0-100'),
        },
      },
    },
  },
} as const;

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

function str(obj: Record<string, unknown>, key: string): string {
  const v = obj[key];
  if (typeof v !== 'string') throw new Error(`Expected string at "${key}"`);
  return v.trim();
}

function pct(obj: Record<string, unknown>, key: string): number {
  const v = obj[key];
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new Error(`Expected number at "${key}"`);
  return Math.min(100, Math.max(0, Math.round(v)));
}

function oneOf<T extends string>(
  obj: Record<string, unknown>,
  key: string,
  allowed: readonly T[],
): T {
  const v = str(obj, key);
  const found = allowed.find((a) => a === v);
  if (!found) throw new Error(`Unexpected value at "${key}"`);
  return found;
}

/**
 * Validates and normalizes model output. Strict mode already guarantees the shape; this guards
 * against model/API drift and enforces the safety rules the schema can't express.
 */
export function parseIdentifyResult(value: unknown): IdentifyResult {
  if (!isRecord(value)) throw new Error('Expected an object');
  if (typeof value.isSpecimen !== 'boolean') throw new Error('Expected boolean at "isSpecimen"');
  if (!value.isSpecimen) return NO_SPECIMEN;

  const traits = value.traits;
  const alternatives = value.alternatives;
  if (!isRecord(traits)) throw new Error('Expected object at "traits"');
  if (!Array.isArray(alternatives)) throw new Error('Expected array at "alternatives"');

  const kind = oneOf(value, 'kind', KINDS);
  // Edibility is a mushroom concept. Rocks never carry one, and a mushroom never reads as
  // "not applicable", so a missing verdict can't look like a safe one.
  const rawEdibility = oneOf(value, 'edibility', EDIBILITIES);
  const edibility: Edibility =
    kind === 'mushroom'
      ? rawEdibility === 'not_applicable'
        ? 'unknown'
        : rawEdibility
      : 'not_applicable';

  const result: IdentifyResult = {
    isSpecimen: true,
    kind,
    name: str(value, 'name'),
    scientificName: str(value, 'scientificName'),
    family: str(value, 'family'),
    confidence: pct(value, 'confidence'),
    traits: Object.fromEntries(TRAIT_KEYS.map((k) => [k, str(traits, k)])) as SpecimenTraits,
    edibility,
    safetyWarning: str(value, 'safetyWarning'),
    summary: str(value, 'summary'),
    funFact: str(value, 'funFact'),
    alternatives: alternatives
      .filter(isRecord)
      .map((a) => ({ name: str(a, 'name'), confidence: pct(a, 'confidence') }))
      .filter((a) => a.name.length > 0)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, MAX_ALTERNATIVES),
  };

  // A nameless specimen is unusable; treat it like no specimen rather than show a blank result.
  if (!result.name || !result.scientificName) return NO_SPECIMEN;
  return result;
}
