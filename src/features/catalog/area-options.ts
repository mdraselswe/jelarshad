import type { AreaOption } from "./components/area-filter";

/** Area chips from a list of area keys, most places first. */
export function buildAreaOptions(keys: string[]): AreaOption[] {
  const counts = new Map<string, number>();
  for (const key of keys) counts.set(key, (counts.get(key) ?? 0) + 1);
  return Array.from(counts, ([key, count]) => ({ key, label: key, count })).sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label, "bn"),
  );
}
