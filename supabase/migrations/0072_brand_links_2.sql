-- Chains whose branches arrived in 0071 (and one new chain: Star Kabab, Little Arabia).
insert into brands (slug, name_bn, name_en) values
  ('star-kabab', 'স্টার কাবাব', 'Star Kabab'),
  ('little-arabia', 'লিটল আরাবিয়া', 'Little Arabia')
on conflict (slug) do nothing;

update places set brand_id = (select id from brands where slug = 'star-kabab')
where slug in ('star-kabab-dhaka', 'star-kabab-dhanmondi', 'star-kabab-thatari-bazar', 'star-kabab-wari',
  'star-kabab-karwan-bazar', 'star-kabab-farmgate', 'star-kabab-banani', 'star-kabab-elephant-road',
  'star-kabab-johnson-road');
update places set brand_id = (select id from brands where slug = 'little-arabia')
where slug in ('little-arabia-motijheel', 'little-arabia-shantinagar');
update places set brand_id = (select id from brands where slug = 'pizzaburg')
where slug in ('pizzaburg-wari', 'pizzaburg-dhanmondi');
update places set brand_id = (select id from brands where slug = 'sultans-dine')
where slug in ('sultans-dine-gulshan');
update places set brand_id = (select id from brands where slug = 'takeout')
where slug in ('takeout-moghbazar');
update places set brand_id = (select id from brands where slug = 'mr-burger')
where slug in ('mr-burger-malibagh');
