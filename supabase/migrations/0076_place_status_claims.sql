-- Every place carries a "still open?" fact people can confirm or dispute. Seeded places had none, so
-- their page showed no verify card at all, and a closed shop could never be flagged from it.
insert into claims (entity, entity_id, type, value)
select 'place', p.id, 'place_status', '{"open": true}'::jsonb
from places p
where p.status = 'active'
  and not exists (
    select 1 from claims c
    where c.entity = 'place' and c.entity_id = p.id and c.type = 'place_status'
  )
on conflict (entity, entity_id, type) do nothing;

-- New places that no person added (seed data, imports) get the same fact automatically. A place a
-- person adds gets its claims from the add flow, which records who started them.
create or replace function seed_place_status_claim()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  if new.created_by is null then
    insert into claims (entity, entity_id, type, value)
    values ('place', new.id, 'place_status', '{"open": true}'::jsonb)
    on conflict (entity, entity_id, type) do nothing;
  end if;
  return new;
end;
$$;

create trigger places_seed_status_claim
  after insert on places
  for each row execute function seed_place_status_claim();
