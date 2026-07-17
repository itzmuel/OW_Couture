-- Supabase-backed product catalog for admin product management.

create table if not exists public.catalog_products (
  slug text primary key,
  name text not null,
  code text not null,
  category text not null,
  collection text not null,
  tagline text not null,
  description text not null,
  price_from text not null,
  lead_time text not null,
  appointment_type text not null,
  image text not null,
  palette text not null,
  materials text[] not null default '{}',
  made_for text[] not null default '{}',
  highlights text[] not null default '{}',
  featured boolean not null default false,
  archived boolean not null default false,
  updated_at timestamptz not null default now()
);

create or replace function public.catalog_products_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists catalog_products_set_updated_at on public.catalog_products;
create trigger catalog_products_set_updated_at
before update on public.catalog_products
for each row execute function public.catalog_products_set_updated_at();

alter table public.catalog_products enable row level security;

drop policy if exists "catalog_products_public_read" on public.catalog_products;
create policy "catalog_products_public_read"
  on public.catalog_products for select
  using (not archived);

insert into public.catalog_products (
  slug, name, code, category, collection, tagline, description, price_from, lead_time,
  appointment_type, image, palette, materials, made_for, highlights, featured, archived
)
values
  ('sculpted-satin-set', 'Sculpted Satin Set', 'OW-EVE-014', 'Eveningwear', 'Bridesmaids & Evening', 'Fluid movement with a precise waist and sharp shoulder line.', 'A made-to-order evening set cut in satin-backed crepe, designed for gallery evenings, private dinners, and event dressing that needs structure without stiffness.', '$1,450', '4 to 6 weeks', 'Private studio fitting', 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80', 'linear-gradient(135deg, #ead6cb 0%, #f7efe7 55%, #c6937b 100%)', array['Satin-backed crepe','Silk lining','Hand-finished hem'], array['Evening events','Editorial styling','Custom color adaptations'], array['Contoured waist seam','Soft drape trouser','Optional detachable sleeve'], true, false),
  ('pearl-column-gown', 'Pearl Column Gown', 'OW-WED-001', 'Bridal', 'Wedding Dresses', 'A minimal bridal silhouette with luminous texture and clean lines.', 'This column gown is built for intimate ceremonies and reception changes, balancing sharp structure through the bodice with a fluid skirt and pearl-detailed back.', '$2,200', '6 to 8 weeks', 'Bridal consultation', 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=900&q=80', 'linear-gradient(135deg, #f6f2ee 0%, #fffaf5 50%, #decdbf 100%)', array['Matte satin','Pearl fastening','Silk organza support'], array['Civil ceremonies','Reception look','Bridal capsule styling'], array['Pearl back detail','Internal corsetry','Custom train options'], true, false),
  ('midnight-tux-dress', 'Midnight Tux Dress', 'OW-RTW-008', 'RTW', 'RTW Collection', 'A sharp crossover between suiting discipline and dress movement.', 'A tailored tux-inspired dress with satin lapels, a sculpted shoulder, and a hemline designed to move cleanly between formal events and after-dark occasions.', '$1,680', '4 to 5 weeks', 'Tailoring consultation', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80', 'linear-gradient(135deg, #2a2425 0%, #63514f 40%, #d4b6a1 100%)', array['Wool barathea','Satin facing','Cupro lining'], array['Black-tie dressing','Press events','Personal wardrobe commissions'], array['Peak lapel neckline','Wrapped skirt front','Internal waist stay'], true, false),
  ('soft-rose-corset', 'Soft Rose Corset', 'OW-EVE-031', 'Eveningwear', 'Bridesmaids & Evening', 'A lighter occasion piece with structure hidden beneath soft drape.', 'Designed as a versatile separate, this corset pairs with skirts or tailored trousers and is fitted to the client through a guided measurement and alteration process.', '$860', '3 to 4 weeks', 'Virtual or studio fitting', 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80', 'linear-gradient(135deg, #efd7d4 0%, #fbf3ef 52%, #d6a89d 100%)', array['Silk faille','Boning channels','Soft cotton lining'], array['Occasion separates','Layered styling','Wardrobe updates'], array['Hidden structure','Adjustable lace back','Optional matching skirt'], false, false),
  ('atelier-trouser-suit', 'Atelier Trouser Suit', 'OW-RTW-022', 'RTW', 'RTW Collection', 'Relaxed authority through custom proportions and precise finishing.', 'A two-piece suit cut to the client with a softened shoulder, elongated line, and optional waist shaping for event dressing, editorial use, or modern bridal alternatives.', '$1,920', '5 to 7 weeks', 'Tailoring consultation', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80', 'linear-gradient(135deg, #d7d1cb 0%, #f7f2ed 54%, #9f8f86 100%)', array['Italian suiting wool','Cupro lining','Horn-effect buttons'], array['Modern bridal','Wardrobe foundations','Power dressing'], array['Extended jacket line','Single-pleat trouser','Multiple fit passes'], false, false),
  ('silk-veil-cape', 'Silk Veil Cape', 'OW-WED-012', 'Bridal', 'Wedding Dresses', 'A lightweight overlay that adds ceremony without overwhelming the look.', 'This cape is designed for pairing with gowns, column dresses, and structured separates, adding movement and presence while keeping the silhouette clean and minimal.', '$640', '2 to 3 weeks', 'Bridal consultation', 'https://images.unsplash.com/photo-1525258946800-98cfd641d0de?auto=format&fit=crop&w=900&q=80', 'linear-gradient(135deg, #f9f4ef 0%, #fffdf9 55%, #e8dacc 100%)', array['Silk tulle','Rolled edges','Discrete fastening'], array['Ceremony styling','Layered bridal looks','Editorial bridal shoots'], array['Air-light finish','Optional pearl trim','Pairs with custom gowns'], false, false)
on conflict (slug) do nothing;
