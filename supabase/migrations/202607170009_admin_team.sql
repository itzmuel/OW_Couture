-- Team management foundation for admin roles and stored permissions.

create table if not exists public.admin_team_members (
  email text primary key,
  full_name text not null,
  role text not null,
  permissions text[] not null default '{}',
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create or replace function public.admin_team_members_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists admin_team_members_set_updated_at on public.admin_team_members;
create trigger admin_team_members_set_updated_at
before update on public.admin_team_members
for each row execute function public.admin_team_members_set_updated_at();

alter table public.admin_team_members enable row level security;

insert into public.admin_team_members (email, full_name, role, permissions, active)
values
  ('samuelonyenwe6@gmail.com', 'Samuel Onyenwe', 'Admin', array['admin:*'], true)
on conflict (email) do update set
  full_name = excluded.full_name,
  role = excluded.role,
  permissions = excluded.permissions,
  active = excluded.active;
