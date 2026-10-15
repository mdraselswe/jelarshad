import { buildSearchFields, toSearchKey } from "../../src/lib/text/normalize";
import { DHAKA_SET_1, type DhakaSet } from "./dhaka-data";
import { DHAKA_SET_2 } from "./dhaka-data-2";
import { DHAKA_SET_3 } from "./dhaka-data-3";
import { DHAKA_SET_4 } from "./dhaka-data-4";
import { DHAKA_SET_5 } from "./dhaka-data-5";
import { DHAKA_SET_6 } from "./dhaka-data-6";
import { DHAKA_SET_7, GAZIPUR_SET } from "./dhaka-data-7";
import { DHAKA_SET_8, GAZIPUR_SET_2 } from "./dhaka-data-8";
import { DHAKA_SET_9 } from "./dhaka-data-9";
import { DHAKA_SET_10 } from "./dhaka-data-10";
import { CHATTOGRAM_SET, SYLHET_SET } from "./districts-data";
import { BOGURA_SET, CUMILLA_SET, KHULNA_SET, RAJSHAHI_SET } from "./districts-data-2";
import { DISTRICT_SETS_4 } from "./districts-data-4";
import { BARISHAL_SET, COXS_BAZAR_SET, MYMENSINGH_SET, RANGPUR_SET } from "./districts-data-3";

// Turns scripts/seed/dhaka-data*.ts into migrations 0013 and 0014. Same rules as build-sql.ts: the app's own
// normalization writes the search fields, and every insert is idempotent.

const q = (value: string) => `'${value.replace(/'/g, "''")}'`;
const when = (list: string[], sql: string) => (list.length > 0 ? sql.trimEnd() : "");
const rows = (lines: string[]) => lines.map((line) => `  ${line}`).join(",\n");

const DEDUPE_FOODS_SQL = `
-- Foods with exactly the same name become one (seed food first, then the one with a description).
do $$
declare
  r record;
begin
  for r in
    select dup.id as dup_id, dup.keep_id
    from (
      select id,
             first_value(id) over (
               partition by lower(btrim(name_bn))
               order by is_seed desc, (about_bn is not null) desc, created_at, id
             ) as keep_id
      from foods
      where status = 'active'
    ) as dup
    where dup.id <> dup.keep_id
  loop
    perform merge_foods(r.dup_id, r.keep_id);
  end loop;
end;
$$;
`;

export const DHAKA_SETS: DhakaSet[] = [
  DHAKA_SET_1,
  DHAKA_SET_2,
  DHAKA_SET_3,
  DHAKA_SET_4,
  DHAKA_SET_5,
  DHAKA_SET_6,
  DHAKA_SET_7,
  DHAKA_SET_8,
  DHAKA_SET_9,
  DHAKA_SET_10,
  CHATTOGRAM_SET,
  SYLHET_SET,
  KHULNA_SET,
  RAJSHAHI_SET,
  BOGURA_SET,
  CUMILLA_SET,
  BARISHAL_SET,
  MYMENSINGH_SET,
  RANGPUR_SET,
  COXS_BAZAR_SET,
  ...DISTRICT_SETS_4,
  GAZIPUR_SET,
  GAZIPUR_SET_2,
];

export const migrationPath = (set: DhakaSet) => `supabase/migrations/${set.migration}`;

export function buildDhakaSql(set: DhakaSet): string {
  const areaRows = set.areas.map(
    (area) => `(${q(area.slug)}, ${q(area.nameBn)}, ${q(area.nameEn)})`,
  );

  const foodRows = set.foods.map((food) => {
    const search = buildSearchFields(food.nameBn, food.nameEn);
    return `(${q(food.slug)}, ${q(food.nameBn)}, ${q(food.nameEn)}, ${q(food.aboutBn)}, ${q(search.searchText)}, ${q(search.searchKey)}, true)`;
  });
  const foodAliasRows = set.foods.flatMap((food) =>
    food.aliases.map((alias) => `(${q(food.slug)}, ${q(alias)}, ${q(toSearchKey(alias))})`),
  );

  const placeRows = set.places.map((place) => {
    const search = buildSearchFields(place.nameBn, place.nameEn);
    return `(${q(place.slug)}, ${q(place.nameBn)}, ${q(place.nameEn)}, ${q(place.type)}, ${q(place.area)}, ${q(search.searchText)}, ${q(search.searchKey)})`;
  });

  const dishRows = [
    ...set.places.flatMap((place) =>
      place.famousFor.map((food) => `(${q(place.slug)}, ${q(food)})`),
    ),
    ...set.existingDishes.map((dish) => `(${q(dish.slug)}, ${q(dish.food)})`),
  ];

  const fameRows = set.fame.map(
    (fame, index) =>
      `(${q(fame.district)}, ${q(fame.food)}, ${q(fame.noteBn ?? "")}, ${q(fame.sourceUrl)}, ${(set.fameSortStart ?? 10) + index})`,
  );
  const fameSourceRows = set.fameSources.map(
    (fame) => `(${q(fame.district)}, ${q(fame.food)}, ${q(fame.sourceUrl)})`,
  );
  const existingAreaRows = set.existingAreas.map((place) => `(${q(place.slug)}, ${q(place.area)})`);

  return `-- ${set.number}: ${set.districtSlug ? set.districtSlug[0]?.toUpperCase() + set.districtSlug.slice(1) : "Dhaka"} content, by area (generated — do not edit by hand).
-- Source: scripts/seed/dhaka-data.ts · regenerate: pnpm db:seed · sources: docs/content-sources.md
--
-- Same rules as 0007: flagged is_seed (select purge_seed_data(); removes it), and no ratings,
-- reviews, prices, hours, addresses or claims are written here. A place is a name, an area and what
-- it is known for; real people add and verify the rest.

${when(
  areaRows,
  `insert into areas (district_id, slug, name_bn, name_en)
select d.id, v.slug, v.name_bn, v.name_en
from (values
${rows(areaRows)}
) as v(slug, name_bn, name_en)
join districts d on d.slug = '${set.districtSlug ?? "dhaka"}'
on conflict (district_id, slug) do nothing;`,
)}

${when(
  foodRows,
  `insert into foods (slug, name_bn, name_en, about_bn, search_text, search_key, is_seed) values
${rows(foodRows)}
on conflict (slug) do nothing;`,
)}

${when(
  foodAliasRows,
  `insert into aliases (entity, entity_id, alias, search_key)
select 'food', f.id::text, v.alias, v.search_key
from (values
${rows(foodAliasRows)}
) as v(food_slug, alias, search_key)
join foods f on f.slug = v.food_slug
on conflict do nothing;`,
)}

${when(
  placeRows,
  `insert into places (slug, name_bn, name_en, type, district_id, area_id, search_text, search_key, is_seed)
select v.slug, v.name_bn, v.name_en, v.type::place_type, d.id, a.id, v.search_text, v.search_key, true
from (values
${rows(placeRows)}
) as v(slug, name_bn, name_en, type, area_slug, search_text, search_key)
join districts d on d.slug = '${set.districtSlug ?? "dhaka"}'
join areas a on a.district_id = d.id and a.slug = v.area_slug
on conflict (slug) do nothing;`,
)}

${when(
  existingAreaRows,
  `update places p
set area_id = a.id
from (values
${rows(existingAreaRows)}
) as v(place_slug, area_slug), areas a
where p.slug = v.place_slug and a.district_id = p.district_id and a.slug = v.area_slug
  and p.area_id is null;
`,
)}

${when(
  dishRows,
  `insert into dishes (place_id, food_id, is_seed)
select p.id, f.id, true
from (values
${rows(dishRows)}
) as v(place_slug, food_slug)
join places p on p.slug = v.place_slug
join foods f on f.slug = v.food_slug
on conflict (place_id, food_id) do nothing;`,
)}

${when(
  fameRows,
  `insert into regional_fame (district_id, food_id, note_bn, source_url, sort_order, is_seed)
select d.id, f.id, v.note_bn, v.source_url, v.sort_order, true
from (values
${rows(fameRows)}
) as v(district_slug, food_slug, note_bn, source_url, sort_order)
join districts d on d.slug = v.district_slug
join foods f on f.slug = v.food_slug
on conflict (district_id, food_id) do nothing;
`,
)}

${when(
  fameSourceRows,
  `update regional_fame rf
set source_url = v.source_url
from (values
${rows(fameSourceRows)}
) as v(district_slug, food_slug, source_url), districts d, foods f
where d.slug = v.district_slug and f.slug = v.food_slug
  and rf.district_id = d.id and rf.food_id = f.id and rf.source_url is null;
`,
)}

update districts d
set place_count = (select count(*) from places p where p.district_id = d.id and p.status = 'active');
${
  // Migration 0060 added merge_foods. Newer sets fold a food that was already there under another
  // slug (a contributor typed it first) into the project's one, instead of leaving two "চাপ".
  Number(set.number) >= 61 && foodRows.length > 0 ? DEDUPE_FOODS_SQL : ""
}`;
}
