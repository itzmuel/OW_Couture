create table if not exists public.fashion_course_registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  experience_level text not null,
  interest_reason text not null,
  preferred_contact_method text not null,
  cohort_label text not null default 'October 2026',
  registration_deadline date not null default '2026-09-30',
  course_start_date date not null default '2026-10-01',
  status text not null default 'new' check (status in ('new', 'contacted', 'enrolled', 'closed')),
  created_at timestamptz not null default now()
);

create index if not exists fashion_course_registrations_created_at_idx
  on public.fashion_course_registrations (created_at desc);

alter table public.fashion_course_registrations enable row level security;

-- Public users can submit course registrations.
drop policy if exists "fashion_course_registrations_insert_anon" on public.fashion_course_registrations;
create policy "fashion_course_registrations_insert_anon"
  on public.fashion_course_registrations for insert
  to anon
  with check (true);

-- Authenticated users can also submit registrations.
drop policy if exists "fashion_course_registrations_insert_authenticated" on public.fashion_course_registrations;
create policy "fashion_course_registrations_insert_authenticated"
  on public.fashion_course_registrations for insert
  to authenticated
  with check (true);
