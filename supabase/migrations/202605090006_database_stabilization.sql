create table public.drivers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  organization_membership_id uuid references public.organization_memberships(id) on delete set null,
  display_name text not null,
  email text,
  phone text,
  license_number text,
  license_expiry_date date,
  status text not null default 'active' check (status in ('active', 'inactive', 'suspended')),
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, organization_id, user_id)
);

create table public.subcontractors (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  organization_membership_id uuid references public.organization_memberships(id) on delete set null,
  company_name text not null,
  contact_name text,
  email text,
  phone text,
  abn text,
  status text not null default 'active' check (status in ('active', 'inactive', 'suspended')),
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, organization_id, company_name)
);

create index drivers_tenant_id_idx on public.drivers(tenant_id);
create index drivers_organization_id_idx on public.drivers(organization_id);
create index drivers_user_id_idx on public.drivers(user_id);
create index drivers_organization_membership_id_idx on public.drivers(organization_membership_id);
create index drivers_status_idx on public.drivers(status);

create index subcontractors_tenant_id_idx on public.subcontractors(tenant_id);
create index subcontractors_organization_id_idx on public.subcontractors(organization_id);
create index subcontractors_organization_membership_id_idx on public.subcontractors(organization_membership_id);
create index subcontractors_status_idx on public.subcontractors(status);

create index pickup_locations_customer_id_idx on public.pickup_locations(customer_id);
create index delivery_locations_customer_id_idx on public.delivery_locations(customer_id);
create index jobs_pickup_location_id_idx on public.jobs(pickup_location_id);
create index jobs_delivery_location_id_idx on public.jobs(delivery_location_id);
create index runs_vehicle_id_idx on public.runs(vehicle_id);
create index allocations_subcontractor_id_idx on public.allocations(subcontractor_id);
create index allocations_vehicle_id_idx on public.allocations(vehicle_id);

create unique index organization_memberships_tenant_organization_id_idx
on public.organization_memberships(tenant_id, organization_id, id);

create unique index customers_tenant_organization_id_idx
on public.customers(tenant_id, organization_id, id);

create unique index pickup_locations_tenant_organization_id_idx
on public.pickup_locations(tenant_id, organization_id, id);

create unique index delivery_locations_tenant_organization_id_idx
on public.delivery_locations(tenant_id, organization_id, id);

create unique index jobs_tenant_organization_id_idx
on public.jobs(tenant_id, organization_id, id);

create unique index runs_tenant_organization_id_idx
on public.runs(tenant_id, organization_id, id);

create unique index vehicles_tenant_organization_id_idx
on public.vehicles(tenant_id, organization_id, id);

create unique index drivers_tenant_organization_id_idx
on public.drivers(tenant_id, organization_id, id);

create unique index subcontractors_tenant_organization_id_idx
on public.subcontractors(tenant_id, organization_id, id);

create trigger set_drivers_updated_at
before update on public.drivers
for each row execute function public.set_updated_at();

create trigger set_subcontractors_updated_at
before update on public.subcontractors
for each row execute function public.set_updated_at();

alter table public.drivers enable row level security;
alter table public.subcontractors enable row level security;

create policy "tenant members can read drivers"
on public.drivers
for select
to authenticated
using (public.is_tenant_member(tenant_id));

create policy "tenant members can write drivers"
on public.drivers
for all
to authenticated
using (public.is_tenant_member(tenant_id))
with check (public.is_tenant_member(tenant_id));

create policy "tenant members can read subcontractors"
on public.subcontractors
for select
to authenticated
using (public.is_tenant_member(tenant_id));

create policy "tenant members can write subcontractors"
on public.subcontractors
for all
to authenticated
using (public.is_tenant_member(tenant_id))
with check (public.is_tenant_member(tenant_id));

alter table public.runs
add constraint runs_vehicle_id_fkey
foreign key (vehicle_id) references public.vehicles(id) on delete set null;

alter table public.allocations
add constraint allocations_vehicle_id_fkey
foreign key (vehicle_id) references public.vehicles(id) on delete set null;

alter table public.organization_memberships
add constraint organization_memberships_tenant_organization_fkey
foreign key (tenant_id, organization_id)
references public.organizations(tenant_id, id)
on delete cascade;

alter table public.customers
add constraint customers_tenant_organization_fkey
foreign key (tenant_id, organization_id)
references public.organizations(tenant_id, id)
on delete cascade;

alter table public.pickup_locations
add constraint pickup_locations_tenant_organization_fkey
foreign key (tenant_id, organization_id)
references public.organizations(tenant_id, id)
on delete cascade;

alter table public.delivery_locations
add constraint delivery_locations_tenant_organization_fkey
foreign key (tenant_id, organization_id)
references public.organizations(tenant_id, id)
on delete cascade;

alter table public.jobs
add constraint jobs_tenant_organization_fkey
foreign key (tenant_id, organization_id)
references public.organizations(tenant_id, id)
on delete cascade;

alter table public.runs
add constraint runs_tenant_organization_fkey
foreign key (tenant_id, organization_id)
references public.organizations(tenant_id, id)
on delete cascade;

alter table public.run_stops
add constraint run_stops_tenant_organization_fkey
foreign key (tenant_id, organization_id)
references public.organizations(tenant_id, id)
on delete cascade;

alter table public.allocations
add constraint allocations_tenant_organization_fkey
foreign key (tenant_id, organization_id)
references public.organizations(tenant_id, id)
on delete cascade;

alter table public.vehicles
add constraint vehicles_tenant_organization_fkey
foreign key (tenant_id, organization_id)
references public.organizations(tenant_id, id)
on delete cascade;

alter table public.drivers
add constraint drivers_tenant_organization_fkey
foreign key (tenant_id, organization_id)
references public.organizations(tenant_id, id)
on delete cascade;

alter table public.subcontractors
add constraint subcontractors_tenant_organization_fkey
foreign key (tenant_id, organization_id)
references public.organizations(tenant_id, id)
on delete cascade;

alter table public.pickup_locations
add constraint pickup_locations_customer_tenant_organization_fkey
foreign key (tenant_id, organization_id, customer_id)
references public.customers(tenant_id, organization_id, id);

alter table public.delivery_locations
add constraint delivery_locations_customer_tenant_organization_fkey
foreign key (tenant_id, organization_id, customer_id)
references public.customers(tenant_id, organization_id, id);

alter table public.jobs
add constraint jobs_customer_tenant_organization_fkey
foreign key (tenant_id, organization_id, customer_id)
references public.customers(tenant_id, organization_id, id);

alter table public.jobs
add constraint jobs_pickup_location_tenant_organization_fkey
foreign key (tenant_id, organization_id, pickup_location_id)
references public.pickup_locations(tenant_id, organization_id, id);

alter table public.jobs
add constraint jobs_delivery_location_tenant_organization_fkey
foreign key (tenant_id, organization_id, delivery_location_id)
references public.delivery_locations(tenant_id, organization_id, id);

alter table public.runs
add constraint runs_vehicle_tenant_organization_fkey
foreign key (tenant_id, organization_id, vehicle_id)
references public.vehicles(tenant_id, organization_id, id);

alter table public.run_stops
add constraint run_stops_run_tenant_organization_fkey
foreign key (tenant_id, organization_id, run_id)
references public.runs(tenant_id, organization_id, id);

alter table public.run_stops
add constraint run_stops_job_tenant_organization_fkey
foreign key (tenant_id, organization_id, job_id)
references public.jobs(tenant_id, organization_id, id);

alter table public.allocations
add constraint allocations_job_tenant_organization_fkey
foreign key (tenant_id, organization_id, job_id)
references public.jobs(tenant_id, organization_id, id);

alter table public.allocations
add constraint allocations_run_tenant_organization_fkey
foreign key (tenant_id, organization_id, run_id)
references public.runs(tenant_id, organization_id, id);

alter table public.allocations
add constraint allocations_vehicle_tenant_organization_fkey
foreign key (tenant_id, organization_id, vehicle_id)
references public.vehicles(tenant_id, organization_id, id);

alter table public.allocations
add constraint allocations_subcontractor_membership_tenant_organization_fkey
foreign key (tenant_id, organization_id, subcontractor_id)
references public.organization_memberships(tenant_id, organization_id, id);

alter table public.drivers
add constraint drivers_membership_tenant_organization_fkey
foreign key (tenant_id, organization_id, organization_membership_id)
references public.organization_memberships(tenant_id, organization_id, id);

alter table public.subcontractors
add constraint subcontractors_membership_tenant_organization_fkey
foreign key (tenant_id, organization_id, organization_membership_id)
references public.organization_memberships(tenant_id, organization_id, id);
