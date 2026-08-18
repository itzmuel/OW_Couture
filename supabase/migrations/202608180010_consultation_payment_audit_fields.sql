alter table public.consultation_submissions
  add column if not exists stripe_checkout_session_id text,
  add column if not exists stripe_payment_status text not null default 'unpaid' check (stripe_payment_status in ('unpaid', 'checkout-created', 'paid', 'cancelled', 'failed')),
  add column if not exists consultation_fee_amount_cents integer not null default 5000,
  add column if not exists paid_at timestamptz;

create index if not exists consultation_submissions_stripe_session_idx
  on public.consultation_submissions (stripe_checkout_session_id);
