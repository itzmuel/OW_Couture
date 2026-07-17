-- Collection metadata for storefront and admin merchandising.

create table if not exists public.catalog_collections (
  slug text primary key,
  label text not null,
  eyebrow text not null,
  title text not null,
  description text not null,
  cta_eyebrow text not null,
  cta_title text not null,
  cta_body text not null,
  sort_order integer not null default 0,
  archived boolean not null default false,
  updated_at timestamptz not null default now()
);

create or replace function public.catalog_collections_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists catalog_collections_set_updated_at on public.catalog_collections;
create trigger catalog_collections_set_updated_at
before update on public.catalog_collections
for each row execute function public.catalog_collections_set_updated_at();

alter table public.catalog_collections enable row level security;

drop policy if exists "catalog_collections_public_read" on public.catalog_collections;
create policy "catalog_collections_public_read"
  on public.catalog_collections for select
  using (not archived);

insert into public.catalog_collections (slug, label, eyebrow, title, description, cta_eyebrow, cta_title, cta_body, sort_order, archived)
values
  ('wedding', 'Wedding Dresses', 'Wedding Dresses', 'A gown with your name in the details.', 'Choose Order, Bespoke Service, or Customize. Additional measurements will be taken during your consultation.', 'Book a Bridal Consultation', 'Start your bridal journey.', 'A $50 non-refundable fee is required to secure your appointment.', 1, false),
  ('rtw', 'RTW Collection', 'RTW Collection', 'Ready-to-wear, made slowly.', 'Pre-order refined silhouettes or customize measurements before checkout.', 'Book a Tailoring Consultation', 'Get the fit right.', 'A $50 non-refundable fee is required to secure your appointment.', 2, false),
  ('evening', 'Bridesmaids & Evening', 'Bridesmaids & Evening', 'Elegant pieces for moments that last.', 'Pre-order or customize selected occasionwear. Consultation is recommended for complex bridal-party orders.', 'Book a Consultation', 'Dress your whole party.', 'A $50 non-refundable fee is required to secure your appointment.', 3, false)
on conflict (slug) do nothing;
