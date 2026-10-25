import type { Place } from "@/core/domain/catalog";
import { getServices } from "@/infrastructure/container";

import type { MergeCandidate } from "./actions";

const LIMIT = 4;

/**
 * Places that may be the same as this one: a search by its Bangla name (and its English name, if
 * it has one), the place itself left out, the same district first.
 */
export async function mergeCandidates(place: Place): Promise<MergeCandidate[]> {
  const { search } = getServices();
  const names = [place.nameBn, place.nameEn].filter((name): name is string => Boolean(name));
  const outcomes = await Promise.all(names.map((name) => search.search(name)));
  const seen = new Set<string>([place.slug]);
  const hits = outcomes
    .flatMap((outcome) => outcome.places)
    .filter((hit) => (seen.has(hit.slug) ? false : (seen.add(hit.slug), true)))
    .sort(
      (a, b) =>
        Number(b.district.slug === place.district.slug) -
        Number(a.district.slug === place.district.slug),
    );
  return hits.slice(0, LIMIT).map((hit) => ({
    slug: hit.slug,
    nameBn: hit.nameBn,
    districtNameBn: hit.district.nameBn,
    areaNameBn: hit.areaNameBn,
  }));
}
