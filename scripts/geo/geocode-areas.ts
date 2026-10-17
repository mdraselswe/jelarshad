/**
 * Looks up a centre point for every neighbourhood in the seed with OpenStreetMap's Nominatim
 * (data (c) OpenStreetMap contributors, ODbL) and writes migration 0077. One request a second, as
 * their usage policy asks. Run once: `pnpm tsx scripts/geo/geocode-areas.ts`. Places that cannot be
 * resolved are listed and left without a centre, never guessed.
 */
import { writeFileSync } from "node:fs";

import { DHAKA_SETS } from "../seed/build-dhaka-sql";
import { DISTRICTS } from "../seed/data";

const districtEn = new Map(DISTRICTS.map((district) => [district.slug, district.nameEn]));
type Row = { district: string; slug: string; nameEn: string };
const rows: Row[] = [];
const seen = new Set<string>();
for (const set of DHAKA_SETS) {
  for (const area of set.areas) {
    const district = set.districtSlug ?? "dhaka";
    const key = `${district}/${area.slug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({ district, slug: area.slug, nameEn: area.nameEn });
  }
}

const PLACE_KINDS = new Set([
  "suburb",
  "neighbourhood",
  "quarter",
  "village",
  "town",
  "city",
  "city_district",
  "hamlet",
  "locality",
  "administrative",
  "residential",
]);
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type Hit = { lat: string; lon: string; category: string; type: string; display_name: string };

async function lookup(row: Row): Promise<{ lat: number; lng: number } | null> {
  const place = districtEn.get(row.district) ?? row.district;
  const q = `${row.nameEn}, ${place}, Bangladesh`;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=jsonv2&limit=8&countrycodes=bd`;
  const response = await fetch(url, {
    headers: { "User-Agent": "jelarshad-geocoder/1.0 (rrasel141@gmail.com)" },
  });
  if (!response.ok) return null;
  const hits = (await response.json()) as Hit[];
  const hit = hits.find(
    (candidate) =>
      (candidate.category === "place" || candidate.category === "boundary") &&
      PLACE_KINDS.has(candidate.type),
  );
  if (hit) return { lat: Number(hit.lat), lng: Number(hit.lon) };
  return row.district === "dhaka" ? lookupInDhaka(row) : null;
}

/**
 * A second try for Dhaka's many small named spots (a road, a market, a crossing): search only inside
 * Dhaka's box, and accept the first hit whose name contains the neighbourhood's first word, so a
 * random building elsewhere is never taken for it.
 */
async function lookupInDhaka(row: Row): Promise<{ lat: number; lng: number } | null> {
  await sleep(1100);
  const word = row.nameEn.split(/\s+/)[0]?.toLowerCase() ?? "";
  const box = "90.28,23.95,90.52,23.65";
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(row.nameEn)}&format=jsonv2&limit=8&viewbox=${box}&bounded=1`;
  const response = await fetch(url, {
    headers: { "User-Agent": "jelarshad-geocoder/1.0 (rrasel141@gmail.com)" },
  });
  if (!response.ok) return null;
  const hits = (await response.json()) as Hit[];
  const hit = hits.find(
    (candidate) => word !== "" && candidate.display_name.toLowerCase().includes(word),
  );
  return hit ? { lat: Number(hit.lat), lng: Number(hit.lon) } : null;
}

async function main() {
  const lines: string[] = [];
  const missing: string[] = [];
  for (const row of rows) {
    const found = await lookup(row).catch(() => null);
    if (found) {
      lines.push(
        `  ('${row.district}', '${row.slug}', ${found.lat.toFixed(5)}, ${found.lng.toFixed(5)})`,
      );
    } else missing.push(`${row.district}/${row.slug} (${row.nameEn})`);
    await sleep(1100);
  }
  const sql = `-- A centre point per neighbourhood, for "near me". Looked up with OpenStreetMap's Nominatim
-- (data (c) OpenStreetMap contributors, ODbL) by scripts/geo/geocode-areas.ts; neighbourhoods it could
-- not resolve have no centre and are left out of "near me" rather than guessed.
alter table areas
  add column lat double precision check (lat between -90 and 90),
  add column lng double precision check (lng between -180 and 180);

update areas a
set lat = v.lat, lng = v.lng
from (values
${lines.join(",\n")}
) as v(district_slug, slug, lat, lng)
join districts d on d.slug = v.district_slug
where a.district_id = d.id and a.slug = v.slug;
`;
  writeFileSync("supabase/migrations/0077_area_centers.sql", sql);
  console.log(`resolved ${lines.length} of ${rows.length}`);
  if (missing.length) console.log("unresolved:", missing.join("; "));
}

void main();
