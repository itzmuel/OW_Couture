-- Basic website CMS content blocks for homepage editing.

create table if not exists public.site_content (
  key text primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.site_content_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists site_content_set_updated_at on public.site_content;
create trigger site_content_set_updated_at
before update on public.site_content
for each row execute function public.site_content_set_updated_at();

alter table public.site_content enable row level security;

drop policy if exists "site_content_public_read" on public.site_content;
create policy "site_content_public_read"
  on public.site_content for select
  using (true);

insert into public.site_content (key, content)
values
  (
    'homepage',
    jsonb_build_object(
      'heroTitle', 'OW Couture.',
      'heroSubtitle', 'Made to order. Made for you.',
      'aboutTitle', 'Not fast fashion. Lasting fashion.',
      'aboutBody', 'OW Couture is a made-to-order fashion house creating refined bridal, ready-to-wear, bridesmaids, and evening pieces. Our process is personal, intentional, and tailored around the woman wearing the garment.',
      'testimonialTitle', 'Obsessed with your experience.',
      'testimonialBody', 'Timeless pieces. Your favourite outfit waiting to happen. Bringing dreams to reality.',
      'contactTitle', 'Contact',
      'contactBody', 'Email: hello@owcouture.com\nFallback: info@owcouture.com\nInstagram: @OWCouture'
    )
  )
on conflict (key) do nothing;
