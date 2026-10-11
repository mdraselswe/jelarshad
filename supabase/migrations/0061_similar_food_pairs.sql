-- 0061: pairs of active foods whose names are close ("সালাদ" / "ছালাদ"), for the admin duplicate
-- list. Trigram similarity over the phonetic search key, the same measure search uses. Read-only; the
-- merge itself is merge_foods (0060).
create or replace function similar_food_pairs(p_min real default 0.55, p_limit int default 30)
returns table (
  a_id uuid, a_slug text, a_name text, a_experiences int,
  b_id uuid, b_slug text, b_name text, b_experiences int,
  similarity real
)
language sql stable security definer
set search_path = public, extensions
as $$
  select a.id, a.slug, a.name_bn, a.experience_count,
         b.id, b.slug, b.name_bn, b.experience_count,
         similarity(a.search_key, b.search_key)::real
  from foods a
  join foods b on a.id < b.id and a.status = 'active' and b.status = 'active'
  where a.search_key % b.search_key and similarity(a.search_key, b.search_key) >= p_min
  order by 9 desc
  limit p_limit
$$;

revoke execute on function similar_food_pairs(real, int) from public, anon, authenticated;
grant execute on function similar_food_pairs(real, int) to service_role;
