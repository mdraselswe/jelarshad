-- Neighbourhoods typed by people could duplicate an existing one: "আফতাবনগর" typed in the admin
-- form became a second area (slug aftabonogor) next to the seeded one (slug aftabnagar), so the
-- seeded page showed no places. The app now matches typed names to existing areas; this cleans up
-- what was already created.
--
-- 1. Areas of one district with the same Bangla name (ignoring spaces) become one: the oldest
--    (lowest id) keeps its places and famous-for rows, the others are removed.
with keyed as (
  select id, district_id, regexp_replace(name_bn, '\s', '', 'g') as name_key from areas
),
dups as (
  select k.id as dup_id,
         (select min(k2.id) from keyed k2
           where k2.district_id = k.district_id and k2.name_key = k.name_key) as keep_id
  from keyed k
)
update places p set area_id = d.keep_id
from dups d
where p.area_id = d.dup_id and d.dup_id <> d.keep_id;

with keyed as (
  select id, district_id, regexp_replace(name_bn, '\s', '', 'g') as name_key from areas
),
dups as (
  select k.id as dup_id,
         (select min(k2.id) from keyed k2
           where k2.district_id = k.district_id and k2.name_key = k.name_key) as keep_id
  from keyed k
)
update regional_fame f set area_id = d.keep_id
from dups d
where f.area_id = d.dup_id and d.dup_id <> d.keep_id;

delete from areas a
where exists (
  select 1 from areas k
  where k.district_id = a.district_id
    and regexp_replace(k.name_bn, '\s', '', 'g') = regexp_replace(a.name_bn, '\s', '', 'g')
    and k.id < a.id
);

-- 2. Free text typed as a neighbourhood with an address in it ("আফতাব নগর, আড্ডার মোড়") made an
--    area of its own. Seeded names never contain a comma; such an area left without places is
--    removed.
delete from areas a
where a.name_bn like '%,%'
  and not exists (select 1 from places p where p.area_id = a.id)
  and not exists (select 1 from regional_fame f where f.area_id = a.id);
