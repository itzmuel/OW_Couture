create table if not exists public.fashion_course_recovery_rate_limits (
  identifier text primary key,
  attempt_count integer not null default 0,
  window_started_at timestamptz not null default now(),
  last_attempt_at timestamptz not null default now(),
  blocked_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fashion_course_recovery_rate_limits_blocked_until_idx
  on public.fashion_course_recovery_rate_limits (blocked_until);

create index if not exists fashion_course_recovery_rate_limits_last_attempt_at_idx
  on public.fashion_course_recovery_rate_limits (last_attempt_at);

alter table public.fashion_course_recovery_rate_limits enable row level security;

drop policy if exists "fashion_course_recovery_rate_limits_no_access_anon" on public.fashion_course_recovery_rate_limits;
create policy "fashion_course_recovery_rate_limits_no_access_anon"
  on public.fashion_course_recovery_rate_limits for all
  to anon
  using (false)
  with check (false);

drop policy if exists "fashion_course_recovery_rate_limits_no_access_authenticated" on public.fashion_course_recovery_rate_limits;
create policy "fashion_course_recovery_rate_limits_no_access_authenticated"
  on public.fashion_course_recovery_rate_limits for all
  to authenticated
  using (false)
  with check (false);
