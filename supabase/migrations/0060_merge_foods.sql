-- 0060: merging a duplicate food into the right one ("চাপ" added twice, once by a contributor and once
-- by the project's seed). Same idea as merge_places (0012): dishes, experiences, claims, saved items,
-- the curated "famous for" rows and aliases move to the surviving food; the duplicate stays as a row
-- with status 'merged' and `merged_into`, so its old links can redirect.
alter table foods add column merged_into uuid references foods;

create or replace function merge_foods(p_from uuid, p_into uuid)
returns int
language plpgsql security definer
set search_path = public
as $$
declare
  d record;
  target uuid;
  moved int := 0;
begin
  if p_from = p_into then
    raise exception 'A food cannot be merged into itself';
  end if;
  if not exists (select 1 from foods where id = p_into and status = 'active') then
    raise exception 'The surviving food must be active';
  end if;
  if not exists (select 1 from foods where id = p_from) then
    raise exception 'Unknown food to merge';
  end if;

  -- Dishes: where the same place already serves the surviving food the two dishes become one.
  for d in select id, place_id from dishes where food_id = p_from loop
    select id into target from dishes where place_id = d.place_id and food_id = p_into;
    if target is null then
      update dishes set food_id = p_into where id = d.id;
    else
      delete from experiences e
        where e.dish_id = d.id
          and exists (select 1 from experiences k where k.dish_id = target and k.user_id = e.user_id);
      update experiences set dish_id = target where dish_id = d.id;
      delete from claims c
        where c.entity = 'dish' and c.entity_id = d.id
          and exists (
            select 1 from claims k where k.entity = 'dish' and k.entity_id = target and k.type = c.type
          );
      update claims set entity_id = target where entity = 'dish' and entity_id = d.id;
      delete from dishes where id = d.id;
      perform refresh_dish_stats(target);
    end if;
    moved := moved + 1;
  end loop;

  -- "Famous for": one row per (district, food); keep the survivor's.
  delete from regional_fame f
    where f.food_id = p_from
      and exists (
        select 1 from regional_fame k where k.district_id = f.district_id and k.food_id = p_into
      );
  update regional_fame set food_id = p_into where food_id = p_from;

  -- Aliases ("chap", "chaop"…) keep finding the food through the survivor.
  delete from aliases a
    where a.entity = 'food' and a.entity_id = p_from::text
      and exists (
        select 1 from aliases k
        where k.entity = 'food' and k.entity_id = p_into::text and k.search_key = a.search_key
      );
  update aliases set entity_id = p_into::text where entity = 'food' and entity_id = p_from::text;

  delete from saved_items s
    where s.entity = 'food' and s.entity_id = p_from::text
      and exists (
        select 1 from saved_items k
        where k.user_id = s.user_id and k.entity = 'food' and k.entity_id = p_into::text and k.kind = s.kind
      );
  update saved_items set entity_id = p_into::text where entity = 'food' and entity_id = p_from::text;

  update district_stamps set food_id = p_into where food_id = p_from;

  update foods set status = 'merged', merged_into = p_into where id = p_from;
  update foods f set
    experience_count = coalesce(
      (select sum(loved_count + okay_count + disliked_count) from dishes where food_id = p_into), 0
    ),
    loved_count = coalesce((select sum(loved_count) from dishes where food_id = p_into), 0)
    where f.id = p_into;
  return moved;
end;
$$;

revoke execute on function merge_foods(uuid, uuid) from public, anon, authenticated;
grant execute on function merge_foods(uuid, uuid) to service_role;

-- One-off clean-up: foods that share exactly the same name. The project's own (seed) food wins, then
-- the one with a description, then the older one.
do $$
declare
  r record;
begin
  for r in
    select dup.id as dup_id, keep.id as keep_id
    from (
      select id,
             first_value(id) over (
               partition by lower(btrim(name_bn))
               order by is_seed desc, (about_bn is not null) desc, created_at, id
             ) as keep_id
      from foods
      where status = 'active'
    ) as dup
    join foods keep on keep.id = dup.keep_id
    where dup.id <> dup.keep_id
  loop
    perform merge_foods(r.dup_id, r.keep_id);
  end loop;
end;
$$;
