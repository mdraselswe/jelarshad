-- 0063: a weekly board per district (docs/00-decisions.md P15). Each earning action now remembers the
-- district it happened in, so "this week's most active in Bogura" is one query.
alter table point_events add column district_id smallint references districts;

-- Past actions: an experience belongs to the district of its place; a new place to its own district.
update point_events e
set district_id = p.district_id
from experiences x
join dishes d on d.id = x.dish_id
join places p on p.id = d.place_id
where e.entity = 'experience' and e.entity_id = x.id::text;

update point_events e
set district_id = p.district_id
from places p
where e.entity = 'place' and e.entity_id = p.id::text;

create index point_events_district_week_idx on point_events (district_id, created_at desc)
  where revoked_at is null and district_id is not null;

-- award_points gains an optional district; the old five-argument form is replaced, so a call with
-- five arguments still works (the new one has a default).
drop function award_points(uuid, text, text, text, int);

create or replace function award_points(
  p_user uuid, p_kind text, p_entity text, p_entity_id text, p_points int,
  p_district smallint default null
)
returns int
language plpgsql security definer
set search_path = public
as $$
begin
  insert into point_events (user_id, kind, entity, entity_id, points, district_id)
  values (p_user, p_kind, p_entity, p_entity_id, p_points, p_district)
  on conflict (user_id, kind, entity_id) do nothing;
  if not found then
    return 0;
  end if;
  update profiles set points_total = points_total + p_points where id = p_user;
  return p_points;
end;
$$;

revoke execute on function award_points(uuid, text, text, text, int, smallint) from public, anon, authenticated;
grant execute on function award_points(uuid, text, text, text, int, smallint) to service_role;

-- The most XP since a date in one district, among people who chose to be listed.
create or replace function district_leaderboard(p_district smallint, p_since timestamptz, p_limit int)
returns table (user_id uuid, display_name text, xp int)
language sql security definer
set search_path = public
as $$
  select e.user_id, p.display_name, sum(e.points)::int as xp
  from point_events e
  join profiles p on p.id = e.user_id
  where e.revoked_at is null
    and e.district_id = p_district
    and e.created_at >= p_since
    and p.leaderboard_opt_in
    and not p.is_banned
  group by e.user_id, p.display_name
  order by xp desc, p.display_name
  limit greatest(1, least(p_limit, 20));
$$;

revoke execute on function district_leaderboard(smallint, timestamptz, int) from public, anon, authenticated;
grant execute on function district_leaderboard(smallint, timestamptz, int) to service_role;
