import { HttpsError } from 'firebase-functions/https';
import { describe, expect, it } from 'vitest';

import { parseImagePath } from '../src/identify/imagePath';
import { toEffort } from '../src/identify/openai';
import { usedToday, utcDay } from '../src/identify/rateLimit';
import { NO_SPECIMEN, parseIdentifyResult } from '../src/identify/schema';

const traits = {
  rockType: 'mineral',
  hardness: '7',
  luster: 'Vitreous',
  color: 'Purple',
  streak: 'White',
  composition: 'SiO₂',
  cap: '',
  stem: '',
  gills: '',
  sporePrint: '',
  habitat: 'Volcanic geodes',
  region: 'Brazil, Uruguay',
  season: '',
};

const amethyst = {
  isSpecimen: true,
  kind: 'mineral',
  name: 'Amethyst',
  scientificName: 'Quartz var. amethyst',
  family: 'Silicate',
  confidence: 97,
  traits,
  edibility: 'not_applicable',
  safetyWarning: '',
  summary: 'A purple quartz.',
  funFact: 'Amethyst gets its color from iron and natural radiation.',
  alternatives: [{ name: 'Fluorite', confidence: 2 }],
};

const flyAgaric = {
  ...amethyst,
  kind: 'mushroom',
  name: 'Fly Agaric',
  scientificName: 'Amanita muscaria',
  family: 'Amanitaceae',
  edibility: 'poisonous',
  safetyWarning: 'Toxic. Never eat wild mushrooms without an expert.',
};

const codeOf = (fn: () => unknown) => {
  try {
    fn();
  } catch (e) {
    return e instanceof HttpsError ? e.code : 'not-https-error';
  }
  return 'ok';
};

describe('parseImagePath', () => {
  const uid = 'alice';
  const check = (imagePath: unknown, requestId = 'abc-123_X') =>
    codeOf(() => parseImagePath({ imagePath }, uid, requestId));

  it('accepts the upload that matches the request', () => {
    expect(
      parseImagePath({ imagePath: 'rockmushroom/alice/uploads/abc-123_X.jpg' }, uid, 'abc-123_X'),
    ).toBe('rockmushroom/alice/uploads/abc-123_X.jpg');
  });

  it('rejects other users’ paths', () => {
    expect(check('rockmushroom/bob/uploads/abc-123_X.jpg')).toBe('permission-denied');
    expect(check('rockmushroom/alice2/uploads/abc-123_X.jpg')).toBe('permission-denied');
    expect(check('rockmushroom/alice/sightings/abc-123_X.jpg')).toBe('permission-denied');
  });

  it('rejects an upload that belongs to a different request', () => {
    expect(check('rockmushroom/alice/uploads/other.jpg')).toBe('invalid-argument');
  });

  it('rejects traversal, nesting and bad names', () => {
    expect(check('rockmushroom/alice/uploads/../../bob/uploads/a.jpg', 'a')).toBe('invalid-argument');
    expect(check('rockmushroom/alice/uploads/nested/a.jpg', 'a')).toBe('invalid-argument');
    expect(check('rockmushroom/alice/uploads/a.png', 'a')).toBe('invalid-argument');
    expect(check('rockmushroom/alice/uploads/.jpg', '')).toBe('invalid-argument');
  });

  it('rejects missing or non-string input', () => {
    expect(codeOf(() => parseImagePath(undefined, uid, 'a'))).toBe('invalid-argument');
    expect(codeOf(() => parseImagePath({}, uid, 'a'))).toBe('invalid-argument');
    expect(check(42)).toBe('invalid-argument');
    expect(check('')).toBe('invalid-argument');
  });
});

describe('parseIdentifyResult', () => {
  it('passes a valid result through', () => {
    expect(parseIdentifyResult(amethyst)).toEqual(amethyst);
    expect(parseIdentifyResult(flyAgaric)).toEqual(flyAgaric);
  });

  it('normalizes isSpecimen=false to the empty result', () => {
    expect(parseIdentifyResult({ ...amethyst, isSpecimen: false })).toEqual(NO_SPECIMEN);
  });

  it('clamps confidence and trims text', () => {
    const r = parseIdentifyResult({ ...amethyst, confidence: 140.6, name: '  Citrine ' });
    expect(r.confidence).toBe(100);
    expect(r.name).toBe('Citrine');
    expect(parseIdentifyResult({ ...amethyst, confidence: -5 }).confidence).toBe(0);
  });

  it('keeps at most two alternatives, most likely first', () => {
    const r = parseIdentifyResult({
      ...amethyst,
      alternatives: [
        { name: 'A', confidence: 5 },
        { name: 'B', confidence: 30 },
        { name: '', confidence: 50 },
        { name: 'C', confidence: 10 },
      ],
    });
    expect(r.alternatives).toEqual([
      { name: 'B', confidence: 30 },
      { name: 'C', confidence: 10 },
    ]);
  });

  it('treats a nameless specimen as no specimen', () => {
    expect(parseIdentifyResult({ ...amethyst, name: ' ' })).toEqual(NO_SPECIMEN);
  });

  it('never lets a mushroom read as "not applicable", and rocks never carry an edibility', () => {
    expect(parseIdentifyResult({ ...flyAgaric, edibility: 'not_applicable' }).edibility).toBe(
      'unknown',
    );
    expect(parseIdentifyResult({ ...amethyst, edibility: 'edible' }).edibility).toBe(
      'not_applicable',
    );
  });

  it('accepts the psychoactive verdict for mushrooms', () => {
    expect(parseIdentifyResult({ ...flyAgaric, edibility: 'psychoactive' }).edibility).toBe(
      'psychoactive',
    );
  });

  it('throws on malformed output', () => {
    expect(() => parseIdentifyResult(null)).toThrow();
    expect(() => parseIdentifyResult({ ...amethyst, confidence: '97' })).toThrow();
    expect(() => parseIdentifyResult({ ...amethyst, traits: null })).toThrow();
    expect(() => parseIdentifyResult({ ...amethyst, kind: 'bird' })).toThrow();
  });
});

describe('rate limit helpers', () => {
  it('uses the UTC calendar day', () => {
    expect(utcDay(new Date('2026-09-24T23:59:59Z'))).toBe('2026-09-24');
    expect(utcDay(new Date('2026-09-25T00:00:00Z'))).toBe('2026-09-25');
  });

  it('counts only today’s usage', () => {
    expect(usedToday({ day: '2026-09-24', count: 7 }, '2026-09-24')).toBe(7);
    expect(usedToday({ day: '2026-09-23', count: 50 }, '2026-09-24')).toBe(0);
    expect(usedToday(undefined, '2026-09-24')).toBe(0);
    expect(usedToday({ day: 1, count: 'x' }, '2026-09-24')).toBe(0);
  });
});

describe('toEffort', () => {
  it('accepts supported values and falls back to low', () => {
    expect(toEffort('none')).toBe('none');
    expect(toEffort('high')).toBe('high');
    expect(toEffort('minimal')).toBe('low');
    expect(toEffort('')).toBe('low');
  });
});
