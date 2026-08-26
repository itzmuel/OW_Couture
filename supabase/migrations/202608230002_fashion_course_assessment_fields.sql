alter table public.fashion_course_registrations
  add column if not exists assessment_answers jsonb not null default '{}'::jsonb,
  add column if not exists assessment_score integer not null default 0;
