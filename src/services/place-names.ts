import { appConfig } from "@/config/app.config";
import type { Repositories } from "@/core/ports";
import { containsProfanity } from "@/lib/text/profanity";
import { toSearchKey } from "@/lib/text/normalize";
import { isLatinText } from "@/lib/text/to-bangla";

// The names a place can be found by: the name shown (Bangla first), the name in the other script
// ("Ideal" for "আইডিয়াল"), and a few extra search names people add (a nickname, an old name).

/** Extra search names per place. */
export const MAX_SEARCH_NAMES = 5;

const clean = (value: string | null | undefined) =>
  [...(value ?? "").replace(/\s+/g, " ").trim()].slice(0, appConfig.text.nameMax).join("");

/**
 * The shown name and the Latin name from what a person typed: a name and, optionally, the same name
 * in the other script. Whichever of the two is in Bangla is shown. Two names in the same script
 * keep the first as the name and give the second back as an extra search name.
 */
export function placeNames(
  main: string,
  other?: string | null,
): { nameBn: string; nameEn: string | null; extra: string[] } {
  const first = clean(main);
  const second = clean(other);
  const firstLatin = isLatinText(first);
  if (second === "") return { nameBn: first, nameEn: firstLatin ? first : null, extra: [] };
  const secondLatin = isLatinText(second);
  if (firstLatin && !secondLatin) return { nameBn: second, nameEn: first, extra: [] };
  if (!firstLatin && secondLatin) return { nameBn: first, nameEn: second, extra: [] };
  return { nameBn: first, nameEn: firstLatin ? first : null, extra: [second] };
}

/**
 * Cleans a list of extra search names: drops empty ones, repeats (by search key) and names the
 * place already has (`taken`), and keeps at most MAX_SEARCH_NAMES. null when one is offensive.
 */
export function cleanSearchNames(
  names: readonly string[],
  taken: readonly (string | null)[] = [],
): { alias: string; key: string }[] | null {
  const seen = new Set(taken.filter((name): name is string => Boolean(name)).map(toSearchKey));
  const out: { alias: string; key: string }[] = [];
  for (const raw of names) {
    const alias = clean(raw);
    if (alias === "") continue;
    if (containsProfanity(alias)) return null;
    const key = toSearchKey(alias);
    if (key === "" || seen.has(key)) continue;
    seen.add(key);
    out.push({ alias, key });
    if (out.length === MAX_SEARCH_NAMES) break;
  }
  return out;
}

/** Makes the place's extra search names exactly `names` (already cleaned). */
export async function replaceSearchNames(
  places: Pick<Repositories["places"], "aliases" | "addAlias" | "removeAlias">,
  placeId: string,
  names: { alias: string; key: string }[],
): Promise<void> {
  const wanted = new Set(names.map((name) => name.key));
  const current = await places.aliases(placeId);
  for (const alias of current) {
    const key = toSearchKey(alias);
    if (!wanted.has(key)) await places.removeAlias(placeId, key);
  }
  for (const name of names) await places.addAlias(placeId, name.alias, name.key);
}
