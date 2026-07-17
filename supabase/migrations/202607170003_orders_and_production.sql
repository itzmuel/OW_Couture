-- Orders and production tracking foundation for OW Couture admin.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  order_date date not null default current_date,
  status text not null default 'awaiting-review' check (
    status in (
      'awaiting-review',
      'approved',
      'in-production',
      'ready-for-fitting',
      'ready-to-ship',
      'delivered',
      'cancelled'
    )
  ),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'refunded', 'cancelled')),
  production_stage text not null default 'payment-received' check (
    production_stage in (
      'payment-received',
      'measurements-verified',
      'fabric-ordered',
      'pattern-drafted',
      'cutting',
      'sewing',
      'quality-inspection',
      'packaging',
      'shipping',
      'complete'
    )
  ),
  total_amount numeric(12, 2) not null default 0,
  currency text not null default 'CAD',
  notes text,
  measurements jsonb not null default '{}'::jsonb,
  inspiration_urls text[] not null default '{}',
  shipping_address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_production_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  stage text not null check (
    stage in (
      'payment-received',
      'measurements-verified',
      'fabric-ordered',
      'pattern-drafted',
      'cutting',
      'sewing',
      'quality-inspection',
      'packaging',
      'shipping',
      'complete'
    )
  ),
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (order_id, stage)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create or replace function public.seed_order_production_events()
returns trigger
language plpgsql
as $$
begin
  insert into public.order_production_events (order_id, stage)
  values
    (new.id, 'payment-received'),
    (new.id, 'measurements-verified'),
    (new.id, 'fabric-ordered'),
    (new.id, 'pattern-drafted'),
    (new.id, 'cutting'),
    (new.id, 'sewing'),
    (new.id, 'quality-inspection'),
    (new.id, 'packaging'),
    (new.id, 'shipping'),
    (new.id, 'complete')
  on conflict (order_id, stage) do nothing;

  return new;
end;
$$;

drop trigger if exists orders_seed_events on public.orders;
create trigger orders_seed_events
after insert on public.orders
for each row execute function public.seed_order_production_events();

alter table public.orders enable row level security;
alter table public.order_production_events enable row level security;

drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own"
  on public.orders for select
  using (auth.uid() = customer_user_id);

drop policy if exists "order_events_select_own" on public.order_production_events;
create policy "order_events_select_own"
  on public.order_production_events for select
  using (
    exists (
      select 1
      from public.orders
      where orders.id = order_production_events.order_id
        and orders.customer_user_id = auth.uid()
    )
  );
