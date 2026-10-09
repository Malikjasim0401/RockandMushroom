import { useEffect, useState } from 'react';

/** Steps through 0..length-1 on an interval, wrapping around. Cleans up its timer. */
export function useRotatingIndex(length: number, intervalMs: number): number {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % length), intervalMs);
    return () => clearInterval(timer);
  }, [length, intervalMs]);

  return length > 0 ? index % length : 0;
}
