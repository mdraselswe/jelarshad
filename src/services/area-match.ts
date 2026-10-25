import type { Area } from "@/core/domain";
import { toSearchKey } from "@/lib/text/normalize";

/** Spelling-blind form of a neighbourhood name: "আফতাব নগর" and "আফতাবনগর" become the same. */
const areaKey = (name: string) => toSearchKey(name).replace(/ /g, "");

/**
 * The neighbourhood a person typed, matched to one the district already has whatever the spacing
 * or spelling ("আফতাব নগর, আড্ডার মোড়" is আফতাবনগর). Each comma-separated part is tried; the
 * other parts come back as `rest` (an address). The oldest area wins when names repeat.
 */
export function matchArea(
  areas: readonly Pick<Area, "id" | "nameBn" | "nameEn">[],
  typed: string,
): { area: Pick<Area, "id" | "nameBn"> | null; rest: string | null } {
  const parts = typed
    .split(/[,،;]/)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const byAge = [...areas].sort((a, b) => a.id - b.id);
  for (const [index, part] of parts.entries()) {
    const key = areaKey(part);
    if (key === "") continue;
    const area = byAge.find(
      (candidate) =>
        areaKey(candidate.nameBn) === key ||
        (candidate.nameEn !== null && areaKey(candidate.nameEn) === key),
    );
    if (area) {
      const rest = parts.filter((_, other) => other !== index).join(", ");
      return { area, rest: rest || null };
    }
  }
  return { area: null, rest: null };
}
