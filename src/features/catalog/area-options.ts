import type { AreaOption } from "./components/area-filter";

/**
 * Area chips from a list of places, most places first. `group` is the district: when places span
 * more than one, the filter shows districts first and then the areas of the chosen district.
 */
export function buildAreaOptions(places: { area: string; group?: string }[]): AreaOption[] {
  const counts = new Map<string, AreaOption>();
  for (const place of places) {
    const id = `${place.group ?? ""}/${place.area}`;
    const found = counts.get(id);
    if (found) found.count += 1;
    else {
      counts.set(id, {
        key: place.area,
        label: place.area,
        count: 1,
        ...(place.group ? { group: place.group } : {}),
      });
    }
  }
  return Array.from(counts.values()).sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label, "bn"),
  );
}
