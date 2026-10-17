// "Did you mean": the names closest to what someone typed, by edit distance on search keys (the
// phonetic form, so Bangla and Banglish spellings already agree and what is left is typos).

/** Levenshtein distance between two short strings. */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        (current[j - 1] ?? 0) + 1,
        (previous[j] ?? 0) + 1,
        (previous[j - 1] ?? 0) + cost,
      );
    }
    previous = current;
  }
  return previous[b.length] ?? 0;
}

export type Candidate<T> = { key: string; item: T };

/**
 * The candidates whose key is within a small edit distance of the query key, nearest first. The
 * allowed distance grows with the length of the word (one slip in a short word, two in a long one),
 * and an exact match is not a suggestion.
 */
export function closest<T>(queryKey: string, candidates: Candidate<T>[], limit: number): T[] {
  const query = queryKey.trim();
  if (query.length < 3) return [];
  const allowed = query.length <= 5 ? 1 : query.length <= 9 ? 2 : 3;
  return candidates
    .map((candidate) => ({ candidate, distance: bestDistance(query, candidate.key) }))
    .filter(({ distance }) => distance > 0 && distance <= allowed)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map(({ candidate }) => candidate.item);
}

/** The closer of the whole key and its best matching word, so "doy" meets "doi ghor". */
function bestDistance(query: string, key: string): number {
  const whole = editDistance(query, key);
  const words = key.split(" ").filter(Boolean);
  if (words.length < 2) return whole;
  return Math.min(whole, ...words.map((word) => editDistance(query, word)));
}
