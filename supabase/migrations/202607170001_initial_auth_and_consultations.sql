-- Initial Supabase schema for OW Couture auth/profile and consultation intake.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.consultation_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  phone text not null,
  requested_date date,
  requested_time time,
  consultation_type text not null,
  request text not null,
  status text not null default 'new' check (status in ('new', 'in-progress', 'confirmed')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.consultation_submissions enable row level security;

-- Users can read/update their own profile row.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Authenticated users can create and view their own consultation requests.
drop policy if exists "consultations_insert_own" on public.consultation_submissions;
create policy "consultations_insert_own"
  on public.consultation_submissions for insert
  with check (auth.uid() = user_id);

drop policy if exists "consultations_select_own" on public.consultation_submissions;
create policy "consultations_select_own"
  on public.consultation_submissions for select
  using (auth.uid() = user_id);

-- Service role bypasses RLS automatically and should be used for admin-wide reads.
