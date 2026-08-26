create table if not exists public.fashion_course_recovery_maintenance_runs (
  job_name text primary key,
  last_run_at timestamptz not null default now(),
  last_status text not null default 'success' check (last_status in ('success', 'error')),
  last_deleted_rows integer not null default 0,
  last_retention_days integer not null default 30,
  last_message text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fashion_course_recovery_maintenance_runs enable row level security;

drop policy if exists "fashion_course_recovery_maintenance_runs_no_access_anon" on public.fashion_course_recovery_maintenance_runs;
create policy "fashion_course_recovery_maintenance_runs_no_access_anon"
  on public.fashion_course_recovery_maintenance_runs for all
  to anon
  using (false)
  with check (false);

drop policy if exists "fashion_course_recovery_maintenance_runs_no_access_authenticated" on public.fashion_course_recovery_maintenance_runs;
create policy "fashion_course_recovery_maintenance_runs_no_access_authenticated"
  on public.fashion_course_recovery_maintenance_runs for all
  to authenticated
  using (false)
  with check (false);
