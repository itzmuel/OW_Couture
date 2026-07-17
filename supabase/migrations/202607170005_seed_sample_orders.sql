-- Seed realistic sample orders and line items for admin dashboard and operations views.

insert into public.orders (
  id,
  customer_user_id,
  customer_name,
  customer_email,
  order_date,
  status,
  payment_status,
  production_stage,
  total_amount,
  currency,
  notes,
  measurements,
  inspiration_urls,
  shipping_address,
  created_at,
  updated_at
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    null,
    'Amara Okoye',
    'amara.okoye@example.com',
    current_date,
    'awaiting-review',
    'pending',
    'payment-received',
    2200,
    'CAD',
    'Bride requested pearl back detail and a shortened train for the reception look.',
    '{"bust":"34","waist":"27","hip":"38","height":"5ft 8in","dress_length":"floor"}'::jsonb,
    array['https://pinterest.com/pin/bridal-column-reference'],
    'Toronto, Ontario, Canada',
    now() - interval '2 hours',
    now() - interval '2 hours'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    null,
    'Lillian Mensah',
    'lillian.mensah@example.com',
    current_date - interval '2 day',
    'approved',
    'paid',
    'measurements-verified',
    1680,
    'CAD',
    'Client approved final fabric swatch and requested a subtle waist nip.',
    '{"bust":"36","waist":"29","hip":"40","shoulder":"15","sleeve":"24"}'::jsonb,
    array['https://instagram.com/p/evening-tailoring-reference'],
    'Mississauga, Ontario, Canada',
    now() - interval '2 day',
    now() - interval '2 day'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    null,
    'Teni Adeyemi',
    'teni.adeyemi@example.com',
    current_date - interval '6 day',
    'in-production',
    'paid',
    'cutting',
    2900,
    'CAD',
    'Wedding order with cape add-on and second fitting booked for next week.',
    '{"bust":"35","waist":"28","hip":"39","height":"5ft 7in","veil_length":"cathedral"}'::jsonb,
    array['https://pinterest.com/pin/cape-bridal-look','https://pinterest.com/pin/structured-bodice-reference'],
    'Ottawa, Ontario, Canada',
    now() - interval '6 day',
    now() - interval '6 day'
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    null,
    'Chinelo Obi',
    'chinelo.obi@example.com',
    current_date - interval '10 day',
    'ready-for-fitting',
    'paid',
    'quality-inspection',
    1450,
    'CAD',
    'Evening set is ready for final fitting after hem review.',
    '{"bust":"33","waist":"26","hip":"37","inseam":"31"}'::jsonb,
    array['https://instagram.com/p/sculpted-satin-reference'],
    'Hamilton, Ontario, Canada',
    now() - interval '10 day',
    now() - interval '10 day'
  ),
  (
    '55555555-5555-4555-8555-555555555555',
    null,
    'Kemi Balogun',
    'kemi.balogun@example.com',
    current_date - interval '14 day',
    'ready-to-ship',
    'paid',
    'packaging',
    1920,
    'CAD',
    'Trouser suit pressed, photographed, and awaiting dispatch confirmation.',
    '{"bust":"35","waist":"28","hip":"40","thigh":"23","calf":"14"}'::jsonb,
    array['https://pinterest.com/pin/modern-bridal-suiting'],
    'Montreal, Quebec, Canada',
    now() - interval '14 day',
    now() - interval '14 day'
  ),
  (
    '66666666-6666-4666-8666-666666666666',
    null,
    'Bisi Alade',
    'bisi.alade@example.com',
    current_date - interval '20 day',
    'delivered',
    'paid',
    'complete',
    860,
    'CAD',
    'Client received corset and sent positive post-delivery feedback.',
    '{"bust":"32","waist":"25","hip":"36","armhole":"16"}'::jsonb,
    array['https://instagram.com/p/corset-detail-reference'],
    'Calgary, Alberta, Canada',
    now() - interval '20 day',
    now() - interval '20 day'
  ),
  (
    '77777777-7777-4777-8777-777777777777',
    null,
    'Zara Cole',
    'zara.cole@example.com',
    current_date - interval '27 day',
    'delivered',
    'paid',
    'complete',
    2840,
    'CAD',
    'Two-piece bridal delivery completed ahead of ceremony date.',
    '{"bust":"34","waist":"27","hip":"38","height":"5ft 6in"}'::jsonb,
    array['https://pinterest.com/pin/bridal-minimal-editorial'],
    'Vancouver, British Columbia, Canada',
    now() - interval '27 day',
    now() - interval '27 day'
  )
on conflict (id) do update set
  customer_name = excluded.customer_name,
  customer_email = excluded.customer_email,
  order_date = excluded.order_date,
  status = excluded.status,
  payment_status = excluded.payment_status,
  production_stage = excluded.production_stage,
  total_amount = excluded.total_amount,
  currency = excluded.currency,
  notes = excluded.notes,
  measurements = excluded.measurements,
  inspiration_urls = excluded.inspiration_urls,
  shipping_address = excluded.shipping_address,
  updated_at = excluded.updated_at;

insert into public.order_items (
  id,
  order_id,
  product_slug,
  product_name,
  quantity,
  unit_price,
  created_at
)
values
  ('a1111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'pearl-column-gown', 'Pearl Column Gown', 1, 2200, now() - interval '2 hours'),
  ('a2222222-2222-4222-8222-222222222222', '22222222-2222-4222-8222-222222222222', 'midnight-tux-dress', 'Midnight Tux Dress', 1, 1680, now() - interval '2 day'),
  ('a3333333-3333-4333-8333-333333333333', '33333333-3333-4333-8333-333333333333', 'pearl-column-gown', 'Pearl Column Gown', 1, 2200, now() - interval '6 day'),
  ('a3333333-3333-4333-8333-333333333334', '33333333-3333-4333-8333-333333333333', 'silk-veil-cape', 'Silk Veil Cape', 1, 700, now() - interval '6 day'),
  ('a4444444-4444-4444-8444-444444444444', '44444444-4444-4444-8444-444444444444', 'sculpted-satin-set', 'Sculpted Satin Set', 1, 1450, now() - interval '10 day'),
  ('a5555555-5555-4555-8555-555555555555', '55555555-5555-4555-8555-555555555555', 'atelier-trouser-suit', 'Atelier Trouser Suit', 1, 1920, now() - interval '14 day'),
  ('a6666666-6666-4666-8666-666666666666', '66666666-6666-4666-8666-666666666666', 'soft-rose-corset', 'Soft Rose Corset', 1, 860, now() - interval '20 day'),
  ('a7777777-7777-4777-8777-777777777777', '77777777-7777-4777-8777-777777777777', 'atelier-trouser-suit', 'Atelier Trouser Suit', 1, 1920, now() - interval '27 day'),
  ('a7777777-7777-4777-8777-777777777778', '77777777-7777-4777-8777-777777777777', 'silk-veil-cape', 'Silk Veil Cape', 1, 920, now() - interval '27 day')
on conflict (id) do update set
  product_slug = excluded.product_slug,
  product_name = excluded.product_name,
  quantity = excluded.quantity,
  unit_price = excluded.unit_price;

update public.order_production_events as event
set
  completed = case
    when event.stage = 'payment-received' then true
    when event.stage = 'measurements-verified' and orders.production_stage in ('measurements-verified', 'fabric-ordered', 'pattern-drafted', 'cutting', 'sewing', 'quality-inspection', 'packaging', 'shipping', 'complete') then true
    when event.stage = 'fabric-ordered' and orders.production_stage in ('fabric-ordered', 'pattern-drafted', 'cutting', 'sewing', 'quality-inspection', 'packaging', 'shipping', 'complete') then true
    when event.stage = 'pattern-drafted' and orders.production_stage in ('pattern-drafted', 'cutting', 'sewing', 'quality-inspection', 'packaging', 'shipping', 'complete') then true
    when event.stage = 'cutting' and orders.production_stage in ('cutting', 'sewing', 'quality-inspection', 'packaging', 'shipping', 'complete') then true
    when event.stage = 'sewing' and orders.production_stage in ('sewing', 'quality-inspection', 'packaging', 'shipping', 'complete') then true
    when event.stage = 'quality-inspection' and orders.production_stage in ('quality-inspection', 'packaging', 'shipping', 'complete') then true
    when event.stage = 'packaging' and orders.production_stage in ('packaging', 'shipping', 'complete') then true
    when event.stage = 'shipping' and orders.production_stage in ('shipping', 'complete') then true
    when event.stage = 'complete' and orders.production_stage = 'complete' then true
    else false
  end,
  completed_at = case
    when (
      event.stage = 'payment-received'
      or (event.stage = 'measurements-verified' and orders.production_stage in ('measurements-verified', 'fabric-ordered', 'pattern-drafted', 'cutting', 'sewing', 'quality-inspection', 'packaging', 'shipping', 'complete'))
      or (event.stage = 'fabric-ordered' and orders.production_stage in ('fabric-ordered', 'pattern-drafted', 'cutting', 'sewing', 'quality-inspection', 'packaging', 'shipping', 'complete'))
      or (event.stage = 'pattern-drafted' and orders.production_stage in ('pattern-drafted', 'cutting', 'sewing', 'quality-inspection', 'packaging', 'shipping', 'complete'))
      or (event.stage = 'cutting' and orders.production_stage in ('cutting', 'sewing', 'quality-inspection', 'packaging', 'shipping', 'complete'))
      or (event.stage = 'sewing' and orders.production_stage in ('sewing', 'quality-inspection', 'packaging', 'shipping', 'complete'))
      or (event.stage = 'quality-inspection' and orders.production_stage in ('quality-inspection', 'packaging', 'shipping', 'complete'))
      or (event.stage = 'packaging' and orders.production_stage in ('packaging', 'shipping', 'complete'))
      or (event.stage = 'shipping' and orders.production_stage in ('shipping', 'complete'))
      or (event.stage = 'complete' and orders.production_stage = 'complete')
    ) then orders.updated_at
    else null
  end
from public.orders
where orders.id = event.order_id
  and orders.id in (
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222222',
    '33333333-3333-4333-8333-333333333333',
    '44444444-4444-4444-8444-444444444444',
    '55555555-5555-4555-8555-555555555555',
    '66666666-6666-4666-8666-666666666666',
    '77777777-7777-4777-8777-777777777777'
  );
