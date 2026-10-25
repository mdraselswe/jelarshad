-- A place or food is found by part of its name. `%` compares the whole stored text with the query,
-- so "grill" never reached "Grill & Thrill by Shahnaj Kitchen" (and "গৌর গোপাল" never reached
-- "শ্রী গৌর গোপাল দধি ও মিষ্টান্ন ভাণ্ডার"): the long text dilutes the similarity below the
-- threshold. Word similarity (`<%`) measures the query against the best-matching part of the text;
-- both run on the existing trigram indexes. The score takes the better of the two.
create or replace function search_all(q_text text, q_key text, lim int default 8)
returns table (kind text, id text, slug text, title text, subtitle text, score real)
language sql stable
set search_path = public, extensions
as $$
  (
    -- The first branch names the result columns (UNION takes names from it).
    select 'food' as kind, f.id::text as id, f.slug as slug, f.name_bn as title, null::text as subtitle,
           greatest(similarity(f.search_text, q_text), similarity(f.search_key, q_key),
                    word_similarity(q_text, f.search_text), word_similarity(q_key, f.search_key)) as score
    from foods f
    where f.status = 'active'
      and (f.search_text % q_text or f.search_key % q_key
           or q_text <% f.search_text or q_key <% f.search_key)
    union all
    select 'food', f.id::text, f.slug, f.name_bn, a.alias, similarity(a.search_key, q_key)
    from aliases a
    join foods f on a.entity = 'food' and f.id::text = a.entity_id
    where f.status = 'active' and a.search_key % q_key
    union all
    select 'place', p.id::text, p.slug, p.name_bn, d.name_bn,
           greatest(similarity(p.search_text, q_text), similarity(p.search_key, q_key),
                    word_similarity(q_text, p.search_text), word_similarity(q_key, p.search_key))
    from places p
    join districts d on d.id = p.district_id
    where p.status = 'active'
      and (p.search_text % q_text or p.search_key % q_key
           or q_text <% p.search_text or q_key <% p.search_key)
    union all
    select 'place', p.id::text, p.slug, p.name_bn, d.name_bn,
           greatest(similarity(a.search_key, q_key), word_similarity(q_key, a.search_key))
    from aliases a
    join places p on a.entity = 'place' and p.id::text = a.entity_id
    join districts d on d.id = p.district_id
    where p.status = 'active' and (a.search_key % q_key or q_key <% a.search_key)
    union all
    select 'district', d.id::text, d.slug, d.name_bn, d.division_bn, similarity(d.search_key, q_key)
    from districts d
    where d.search_key % q_key
  )
  order by score desc
  limit lim
$$;
