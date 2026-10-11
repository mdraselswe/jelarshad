// Food and place tiles get one of seven soft colors, picked from a stable seed (a slug or a name), so
// the same item always has the same color (docs/06-design-system.md §2c). Class names are literal so
// Tailwind sees them.
const TONE_CLASSES = [
  "bg-cat-coral-soft text-cat-coral-fg",
  "bg-cat-pink-soft text-cat-pink-fg",
  "bg-cat-violet-soft text-cat-violet-fg",
  "bg-cat-sky-soft text-cat-sky-fg",
  "bg-cat-amber-soft text-cat-amber-fg",
  "bg-cat-teal-soft text-cat-teal-fg",
  "bg-cat-green-soft text-cat-green-fg",
] as const;

export type Tone = "food" | "place" | "district" | "info";

/** Fixed tones for tiles that show a kind of thing rather than one item. */
export const KIND_TONE_CLASS: Record<Tone, string> = {
  food: TONE_CLASSES[0],
  place: TONE_CLASSES[2],
  district: TONE_CLASSES[5],
  info: TONE_CLASSES[3],
};

const TILE_CLASSES = [
  "bg-tile-1",
  "bg-tile-2",
  "bg-tile-3",
  "bg-tile-4",
  "bg-tile-5",
  "bg-tile-6",
] as const;

function hashOf(seed: string): number {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + (char.codePointAt(0) ?? 0)) >>> 0;
  return hash;
}

/** One of six gradient fills for a large tile (district cards), stable per seed. */
export function tileClass(seed: string): string {
  return TILE_CLASSES[hashOf(seed) % TILE_CLASSES.length] ?? TILE_CLASSES[0];
}

export function toneClass(seed: string): string {
  return TONE_CLASSES[hashOf(seed) % TONE_CLASSES.length] ?? TONE_CLASSES[0];
}
