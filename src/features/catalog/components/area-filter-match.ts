const skeleton = (word: string) => word.replace(/[aeiou]/g, "");

/**
 * Loose match of a typed key against a row's words: vowels are dropped on both sides so spelling
 * variants meet ("khilgaon" and "খিলগাঁও" are "klgn" and "klg"), and one may be the start of the
 * other, so a half-typed name still matches.
 */
export function looseMatch(queryKey: string, rowText: string): boolean {
  const rowWords = rowText
    .split(/\s+/)
    .map(skeleton)
    .filter((word) => word.length >= 2);
  return queryKey
    .split(" ")
    .map(skeleton)
    .filter((word) => word.length >= 2)
    .every((word) =>
      rowWords.some((candidate) => candidate.startsWith(word) || word.startsWith(candidate)),
    );
}
