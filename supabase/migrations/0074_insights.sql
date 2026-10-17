-- First-party, privacy-light usage events and error logs. No IP, no cookie, no user id: an event is a
-- name, a path, a few small properties and a random per-tab session id the browser makes up.
create table insight_events (
  id bigserial primary key,
  at timestamptz not null default now(),
  name text not null check (char_length(name) <= 40),
  path text check (char_length(path) <= 200),
  props jsonb not null default '{}'::jsonb,
  session text check (char_length(session) <= 40)
);
create index insight_events_at_idx on insight_events (at desc);
create index insight_events_name_at_idx on insight_events (name, at desc);

create table error_logs (
  id bigserial primary key,
  at timestamptz not null default now(),
  source text not null check (source in ('server', 'client')),
  message text not null check (char_length(message) <= 500),
  stack text check (char_length(stack) <= 4000),
  path text check (char_length(path) <= 200),
  digest text check (char_length(digest) <= 80),
  context jsonb not null default '{}'::jsonb
);
create index error_logs_at_idx on error_logs (at desc);

-- Server-only tables: RLS on, no policies, so only the service role reaches them.
alter table insight_events enable row level security;
alter table error_logs enable row level security;

-- Counts per event name since a date, with distinct sessions.
create or replace function insights_summary(p_since timestamptz)
returns table (name text, events bigint, sessions bigint)
language sql security definer
set search_path = public
as $$
  select e.name, count(*), count(distinct e.session)
  from insight_events e
  where e.at >= p_since
  group by e.name
  order by count(*) desc;
$$;

-- The most searched words since a date (the event's "query" property).
create or replace function insights_top_searches(p_since timestamptz, p_limit int)
returns table (query text, searches bigint, empty bigint)
language sql security definer
set search_path = public
as $$
  select lower(e.props ->> 'query') as query,
         count(*) as searches,
         count(*) filter (where (e.props ->> 'results')::int = 0) as empty
  from insight_events e
  where e.name = 'search' and e.at >= p_since and e.props ->> 'query' is not null
  group by lower(e.props ->> 'query')
  order by count(*) desc
  limit greatest(1, least(p_limit, 50));
$$;

-- Keeps the tables small on the free tier: drops rows older than p_days.
create or replace function purge_insights(p_days int)
returns int
language plpgsql security definer
set search_path = public
as $$
declare removed int;
begin
  delete from insight_events where at < now() - make_interval(days => p_days);
  get diagnostics removed = row_count;
  delete from error_logs where at < now() - make_interval(days => p_days);
  return removed;
end;
$$;

revoke execute on function insights_summary(timestamptz) from public, anon, authenticated;
revoke execute on function insights_top_searches(timestamptz, int) from public, anon, authenticated;
revoke execute on function purge_insights(int) from public, anon, authenticated;
grant execute on function insights_summary(timestamptz) to service_role;
grant execute on function insights_top_searches(timestamptz, int) to service_role;
grant execute on function purge_insights(int) to service_role;
