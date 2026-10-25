-- Usage by the hour and by page, so the owner can see when people came and what they opened.
-- Page views of the admin pages are the owner's own visits: left out of every page-view count
-- (the tracker no longer sends them either; this also cleans the rows recorded before).

create or replace function insights_summary(p_since timestamptz)
returns table (name text, events bigint, sessions bigint)
language sql security definer
set search_path = public
as $$
  select e.name, count(*), count(distinct e.session)
  from insight_events e
  where e.at >= p_since
    and not (e.name = 'page_view' and coalesce(e.path, '') like '/admin%')
  group by e.name
  order by count(*) desc;
$$;

-- Page views and distinct visits per hour since a date, oldest first.
create or replace function insights_hourly(p_since timestamptz)
returns table (hour timestamptz, views bigint, sessions bigint)
language sql security definer
set search_path = public
as $$
  select date_trunc('hour', e.at) as hour, count(*) as views, count(distinct e.session) as sessions
  from insight_events e
  where e.name = 'page_view' and e.at >= p_since and coalesce(e.path, '') not like '/admin%'
  group by date_trunc('hour', e.at)
  order by hour;
$$;

-- The most opened pages since a date.
create or replace function insights_top_paths(p_since timestamptz, p_limit int)
returns table (path text, views bigint, sessions bigint)
language sql security definer
set search_path = public
as $$
  select coalesce(e.path, '/') as path, count(*) as views, count(distinct e.session) as sessions
  from insight_events e
  where e.name = 'page_view' and e.at >= p_since and coalesce(e.path, '') not like '/admin%'
  group by coalesce(e.path, '/')
  order by count(*) desc
  limit greatest(1, least(p_limit, 50));
$$;

revoke execute on function insights_hourly(timestamptz) from public, anon, authenticated;
revoke execute on function insights_top_paths(timestamptz, int) from public, anon, authenticated;
grant execute on function insights_hourly(timestamptz) to service_role;
grant execute on function insights_top_paths(timestamptz, int) to service_role;
