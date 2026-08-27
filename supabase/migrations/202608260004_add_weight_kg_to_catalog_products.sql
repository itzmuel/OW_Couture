-- Add product weight for shipping calculations.

alter table public.catalog_products
  add column if not exists weight_kg numeric(5,2) not null default 1;

update public.catalog_products
set weight_kg = case slug
  when 'sculpted-satin-set' then 2.20
  when 'pearl-column-gown' then 3.10
  when 'midnight-tux-dress' then 2.60
  when 'soft-rose-corset' then 1.40
  when 'atelier-trouser-suit' then 2.80
  when 'silk-veil-cape' then 0.60
  else coalesce(weight_kg, 1)
end
where weight_kg is null or weight_kg = 1;
