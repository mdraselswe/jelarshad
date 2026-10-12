-- 0062: levels, streaks, missions and a weekly board (docs/00-decisions.md P15).
-- All of them are computed from point_events, so the only new things are an opt-in flag for the
-- public board, an index for reading one person's recent actions and the board query itself.
alter table profiles add column leaderboard_opt_in boolean not null default false;

create index point_events_user_recent_idx on point_events (user_id, created_at desc)
  where revoked_at is null;

-- The most XP since a date among people who chose to be listed. Names only; nothing else leaves.
create or replace function weekly_leaderboard(p_since timestamptz, p_limit int)
returns table (user_id uuid, display_name text, xp int)
language sql security definer
set search_path = public
as $$
  select e.user_id, p.display_name, sum(e.points)::int as xp
  from point_events e
  join profiles p on p.id = e.user_id
  where e.revoked_at is null
    and e.created_at >= p_since
    and p.leaderboard_opt_in
    and not p.is_banned
  group by e.user_id, p.display_name
  order by xp desc, p.display_name
  limit greatest(1, least(p_limit, 20));
$$;

revoke execute on function weekly_leaderboard(timestamptz, int) from public, anon, authenticated;
grant execute on function weekly_leaderboard(timestamptz, int) to service_role;
