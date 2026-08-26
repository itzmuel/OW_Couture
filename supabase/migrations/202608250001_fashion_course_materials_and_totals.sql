alter table if exists public.fashion_course_registrations
  add column if not exists wants_materials_kit boolean not null default false,
  add column if not exists payment_amount_cents integer not null default 0;

create index if not exists fashion_course_registrations_wants_materials_kit_idx
  on public.fashion_course_registrations (wants_materials_kit);
