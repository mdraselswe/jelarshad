-- The boards show each person's photo (the picture saved from their Google account at sign-in).
drop function if exists weekly_leaderboard(timestamptz, int);
drop function if exists district_leaderboard(smallint, timestamptz, int);

create or replace function weekly_leaderboard(p_since timestamptz, p_limit int)
returns table (user_id uuid, display_name text, avatar_url text, xp int)
language sql security definer
set search_path = public
as $$
  select e.user_id, p.display_name, p.avatar_url, sum(e.points)::int as xp
  from point_events e
  join profiles p on p.id = e.user_id
  where e.revoked_at is null
    and e.created_at >= p_since
    and p.leaderboard_opt_in
    and not p.is_banned
  group by e.user_id, p.display_name, p.avatar_url
  order by xp desc, p.display_name
  limit greatest(1, least(p_limit, 20));
$$;

create or replace function district_leaderboard(p_district smallint, p_since timestamptz, p_limit int)
returns table (user_id uuid, display_name text, avatar_url text, xp int)
language sql security definer
set search_path = public
as $$
  select e.user_id, p.display_name, p.avatar_url, sum(e.points)::int as xp
  from point_events e
  join profiles p on p.id = e.user_id
  where e.revoked_at is null
    and e.created_at >= p_since
    and e.district_id = p_district
    and p.leaderboard_opt_in
    and not p.is_banned
  group by e.user_id, p.display_name, p.avatar_url
  order by xp desc, p.display_name
  limit greatest(1, least(p_limit, 20));
$$;

revoke execute on function weekly_leaderboard(timestamptz, int) from public, anon, authenticated;
grant execute on function weekly_leaderboard(timestamptz, int) to service_role;
revoke execute on function district_leaderboard(smallint, timestamptz, int) from public, anon, authenticated;
grant execute on function district_leaderboard(smallint, timestamptz, int) to service_role;
