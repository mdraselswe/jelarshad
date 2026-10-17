-- Chains whose branches arrived in 0079 to 0085, and four new chains with branches in two places.
insert into brands (slug, name_bn, name_en) values
  ('lone-star-steakhouse', 'লোন স্টার স্টেকহাউস', 'The Lone Star Steakhouse'),
  ('barcode-cafe', 'বারকোড ক্যাফে', 'Barcode Cafe'),
  ('palongki', 'পালংকি', 'Palongki'),
  ('chillox', 'চিলক্স', 'Chillox')
on conflict (slug) do nothing;

update places set brand_id = (select id from brands where slug = 'pizzaburg')
where slug in ('pizzaburg-chattogram', 'pizzaburg-khulna', 'pizzaburg-rajshahi', 'pizzaburg-mymensingh');
update places set brand_id = (select id from brands where slug = 'secret-recipe')
where slug in ('secret-recipe-khulshi');
update places set brand_id = (select id from brands where slug = 'sultans-dine')
where slug in ('sultans-dine-khulna');
update places set brand_id = (select id from brands where slug = 'kacchi-bhai')
where slug in ('kacchi-bhai-rajshahi');
update places set brand_id = (select id from brands where slug = 'kfc')
where slug in ('kfc-khulna');
update places set brand_id = (select id from brands where slug = 'lone-star-steakhouse')
where slug in ('lone-star-steakhouse-dhanmondi', 'lone-star-steakhouse-chattogram');
update places set brand_id = (select id from brands where slug = 'barcode-cafe')
where slug in ('barcode-cafe-banani', 'barcode-cafe-khulshi');
update places set brand_id = (select id from brands where slug = 'palongki')
where slug in ('palongki-kolatoli', 'palongki-inani');
update places set brand_id = (select id from brands where slug = 'chillox')
where slug in ('chillox-mohammadpur', 'chillox-mymensingh');
