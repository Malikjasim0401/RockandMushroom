export type MohsRange = { min: number; max: number };

/** Reads "7", "6–6.5" or "5.5 to 6" from a model-written hardness string. */
export function parseMohs(value: string): MohsRange | null {
  const numbers = (value.match(/\d+(?:\.\d+)?/g) ?? [])
    .map(Number)
    .filter((n) => n >= 1 && n <= 10);
  const [first, second] = numbers;
  if (first === undefined) return null;
  const other = second ?? first;
  return { min: Math.min(first, other), max: Math.max(first, other) };
}
