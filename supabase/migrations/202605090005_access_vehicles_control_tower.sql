create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  registration_number text not null,
  fleet_number text,
  name text not null,
  vehicle_type text not null default 'truck' check (vehicle_type in ('truck', 'trailer', 'van', 'ute', 'other')),
  status text not null default 'available' check (status in ('available', 'allocated', 'maintenance', 'inactive')),
  refrigerated boolean not null default false,
  temperature_min_c numeric(5,2),
  temperature_max_c numeric(5,2),
  last_service_at timestamptz,
  next_service_due_at timestamptz,
  odometer_km integer,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, organization_id, registration_number)
);

create index vehicles_tenant_id_idx on public.vehicles(tenant_id);
create index vehicles_organization_id_idx on public.vehicles(organization_id);
create index vehicles_status_idx on public.vehicles(status);
create index vehicles_registration_number_idx on public.vehicles(registration_number);

create trigger set_vehicles_updated_at
before update on public.vehicles
for each row execute function public.set_updated_at();

alter table public.vehicles enable row level security;

create policy "tenant members can read vehicles"
on public.vehicles
for select
to authenticated
using (public.is_tenant_member(tenant_id));

create policy "tenant members can write vehicles"
on public.vehicles
for all
to authenticated
using (public.is_tenant_member(tenant_id))
with check (public.is_tenant_member(tenant_id));

insert into public.permissions (key, name, description)
values
  ('vehicles.read', 'Read vehicles', 'View fleet vehicles for an organization.'),
  ('vehicles.write', 'Write vehicles', 'Create and update fleet vehicles for an organization.'),
  ('users.read', 'Read users', 'View organization users and memberships.'),
  ('users.write', 'Write users', 'Invite and manage organization users.'),
  ('control_tower.read', 'Read control tower', 'View the operational control tower.')
on conflict (key) where tenant_id is null do update
set
  name = excluded.name,
  description = excluded.description;

insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from public.roles
cross join public.permissions
where roles.tenant_id is null
  and permissions.tenant_id is null
  and roles.key in ('owner', 'admin')
  and permissions.key in (
    'vehicles.read',
    'vehicles.write',
    'users.read',
    'users.write',
    'control_tower.read'
  )
on conflict (role_id, permission_id) do nothing;

insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from public.roles
join public.permissions on permissions.key in (
  'vehicles.read',
  'vehicles.write',
  'control_tower.read'
)
where roles.tenant_id is null
  and permissions.tenant_id is null
  and roles.key = 'ops_manager'
on conflict (role_id, permission_id) do nothing;

insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from public.roles
join public.permissions on permissions.key = 'vehicles.read'
where roles.tenant_id is null
  and permissions.tenant_id is null
  and roles.key in ('driver', 'mechanic')
on conflict (role_id, permission_id) do nothing;

insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from public.roles
join public.permissions on permissions.key = 'users.read'
where roles.tenant_id is null
  and permissions.tenant_id is null
  and roles.key = 'ops_manager'
on conflict (role_id, permission_id) do nothing;
