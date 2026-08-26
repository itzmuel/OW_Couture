alter table if exists public.fashion_course_registrations
  add column if not exists stripe_checkout_session_id text,
  add column if not exists payment_status text not null default 'unpaid',
  add column if not exists paid_at timestamptz;

create index if not exists fashion_course_registrations_payment_status_idx
  on public.fashion_course_registrations (payment_status);

create index if not exists fashion_course_registrations_stripe_checkout_session_id_idx
  on public.fashion_course_registrations (stripe_checkout_session_id);
