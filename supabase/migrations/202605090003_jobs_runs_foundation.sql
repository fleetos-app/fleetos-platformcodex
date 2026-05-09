create table public.customers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  customer_reference text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pickup_locations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  name text not null,
  address_line_1 text not null,
  address_line_2 text,
  suburb text,
  state text,
  postcode text,
  country text not null default 'AU',
  contact_name text,
  contact_phone text,
  instructions text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.delivery_locations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  name text not null,
  address_line_1 text not null,
  address_line_2 text,
  suburb text,
  state text,
  postcode text,
  country text not null default 'AU',
  contact_name text,
  contact_phone text,
  instructions text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.statuses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.platform_tenants(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  entity_type text not null check (entity_type in ('job', 'run')),
  key text not null,
  label text not null,
  sort_order integer not null default 0,
  is_terminal boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, organization_id, entity_type, key)
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  pickup_location_id uuid references public.pickup_locations(id) on delete set null,
  delivery_location_id uuid references public.delivery_locations(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'allocated', 'in_progress', 'completed', 'cancelled', 'issue_reported')),
  customer_reference text,
  internal_reference text,
  title text not null,
  notes text,
  requested_pickup_at timestamptz,
  requested_delivery_at timestamptz,
  actual_pickup_at timestamptz,
  actual_delivery_at timestamptz,
  temperature_min_c numeric(5,2),
  temperature_max_c numeric(5,2),
  pod_required boolean not null default false,
  pod_document_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  status text not null default 'planned' check (status in ('planned', 'dispatched', 'started', 'loading', 'enroute', 'delivered', 'completed')),
  run_number text not null,
  title text not null,
  planned_start_at timestamptz,
  planned_end_at timestamptz,
  actual_start_at timestamptz,
  actual_end_at timestamptz,
  driver_user_id uuid references auth.users(id) on delete set null,
  subcontractor_id uuid references public.organization_memberships(id) on delete set null,
  vehicle_id uuid,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, organization_id, run_number)
);

create table public.run_stops (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  run_id uuid not null references public.runs(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  stop_type text not null check (stop_type in ('pickup', 'delivery', 'break', 'depot', 'other')),
  sequence integer not null,
  location_name text not null,
  address_line_1 text,
  suburb text,
  state text,
  postcode text,
  planned_arrival_at timestamptz,
  planned_departure_at timestamptz,
  actual_arrival_at timestamptz,
  actual_departure_at timestamptz,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (run_id, sequence)
);

create table public.allocations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  run_id uuid references public.runs(id) on delete set null,
  driver_user_id uuid references auth.users(id) on delete set null,
  subcontractor_id uuid references public.organization_memberships(id) on delete set null,
  vehicle_id uuid,
  status text not null default 'allocated' check (status in ('allocated', 'accepted', 'declined', 'cancelled', 'completed')),
  allocated_at timestamptz not null default now(),
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.status_history (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  entity_type text not null check (entity_type in ('job', 'run')),
  entity_id uuid not null,
  from_status text,
  to_status text not null,
  changed_by uuid references auth.users(id) on delete set null,
  changed_at timestamptz not null default now(),
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.operational_comments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  entity_type text not null check (entity_type in ('job', 'run')),
  entity_id uuid not null,
  body text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index customers_tenant_id_idx on public.customers(tenant_id);
create index customers_organization_id_idx on public.customers(organization_id);
create index pickup_locations_tenant_id_idx on public.pickup_locations(tenant_id);
create index pickup_locations_organization_id_idx on public.pickup_locations(organization_id);
create index delivery_locations_tenant_id_idx on public.delivery_locations(tenant_id);
create index delivery_locations_organization_id_idx on public.delivery_locations(organization_id);
create index statuses_tenant_id_idx on public.statuses(tenant_id);
create index statuses_organization_id_idx on public.statuses(organization_id);
create index jobs_tenant_id_idx on public.jobs(tenant_id);
create index jobs_organization_id_idx on public.jobs(organization_id);
create index jobs_customer_id_idx on public.jobs(customer_id);
create index jobs_status_idx on public.jobs(status);
create index jobs_requested_pickup_at_idx on public.jobs(requested_pickup_at);
create index runs_tenant_id_idx on public.runs(tenant_id);
create index runs_organization_id_idx on public.runs(organization_id);
create index runs_status_idx on public.runs(status);
create index runs_driver_user_id_idx on public.runs(driver_user_id);
create index run_stops_tenant_id_idx on public.run_stops(tenant_id);
create index run_stops_organization_id_idx on public.run_stops(organization_id);
create index run_stops_run_id_idx on public.run_stops(run_id);
create index run_stops_job_id_idx on public.run_stops(job_id);
create index allocations_tenant_id_idx on public.allocations(tenant_id);
create index allocations_organization_id_idx on public.allocations(organization_id);
create index allocations_job_id_idx on public.allocations(job_id);
create index allocations_run_id_idx on public.allocations(run_id);
create index allocations_driver_user_id_idx on public.allocations(driver_user_id);
create index status_history_tenant_id_idx on public.status_history(tenant_id);
create index status_history_organization_id_idx on public.status_history(organization_id);
create index status_history_entity_idx on public.status_history(entity_type, entity_id, changed_at desc);
create index operational_comments_tenant_id_idx on public.operational_comments(tenant_id);
create index operational_comments_organization_id_idx on public.operational_comments(organization_id);
create index operational_comments_entity_idx on public.operational_comments(entity_type, entity_id, created_at desc);

create trigger set_customers_updated_at before update on public.customers for each row execute function public.set_updated_at();
create trigger set_pickup_locations_updated_at before update on public.pickup_locations for each row execute function public.set_updated_at();
create trigger set_delivery_locations_updated_at before update on public.delivery_locations for each row execute function public.set_updated_at();
create trigger set_statuses_updated_at before update on public.statuses for each row execute function public.set_updated_at();
create trigger set_jobs_updated_at before update on public.jobs for each row execute function public.set_updated_at();
create trigger set_runs_updated_at before update on public.runs for each row execute function public.set_updated_at();
create trigger set_run_stops_updated_at before update on public.run_stops for each row execute function public.set_updated_at();
create trigger set_allocations_updated_at before update on public.allocations for each row execute function public.set_updated_at();
create trigger set_status_history_updated_at before update on public.status_history for each row execute function public.set_updated_at();
create trigger set_operational_comments_updated_at before update on public.operational_comments for each row execute function public.set_updated_at();

alter table public.customers enable row level security;
alter table public.pickup_locations enable row level security;
alter table public.delivery_locations enable row level security;
alter table public.statuses enable row level security;
alter table public.jobs enable row level security;
alter table public.runs enable row level security;
alter table public.run_stops enable row level security;
alter table public.allocations enable row level security;
alter table public.status_history enable row level security;
alter table public.operational_comments enable row level security;

create policy "tenant members can read customers" on public.customers for select to authenticated using (public.is_tenant_member(tenant_id));
create policy "tenant members can write customers" on public.customers for all to authenticated using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant members can read pickup locations" on public.pickup_locations for select to authenticated using (public.is_tenant_member(tenant_id));
create policy "tenant members can write pickup locations" on public.pickup_locations for all to authenticated using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant members can read delivery locations" on public.delivery_locations for select to authenticated using (public.is_tenant_member(tenant_id));
create policy "tenant members can write delivery locations" on public.delivery_locations for all to authenticated using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant members can read statuses" on public.statuses for select to authenticated using (tenant_id is null or public.is_tenant_member(tenant_id));
create policy "tenant members can read jobs" on public.jobs for select to authenticated using (public.is_tenant_member(tenant_id));
create policy "tenant members can write jobs" on public.jobs for all to authenticated using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant members can read runs" on public.runs for select to authenticated using (public.is_tenant_member(tenant_id));
create policy "tenant members can write runs" on public.runs for all to authenticated using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant members can read run stops" on public.run_stops for select to authenticated using (public.is_tenant_member(tenant_id));
create policy "tenant members can write run stops" on public.run_stops for all to authenticated using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant members can read allocations" on public.allocations for select to authenticated using (public.is_tenant_member(tenant_id));
create policy "tenant members can write allocations" on public.allocations for all to authenticated using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant members can read status history" on public.status_history for select to authenticated using (public.is_tenant_member(tenant_id));
create policy "tenant members can create status history" on public.status_history for insert to authenticated with check (public.is_tenant_member(tenant_id));
create policy "tenant members can read operational comments" on public.operational_comments for select to authenticated using (public.is_tenant_member(tenant_id));
create policy "tenant members can write operational comments" on public.operational_comments for all to authenticated using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));

insert into public.statuses (entity_type, key, label, sort_order, is_terminal)
values
  ('job', 'pending', 'Pending', 10, false),
  ('job', 'allocated', 'Allocated', 20, false),
  ('job', 'in_progress', 'In progress', 30, false),
  ('job', 'completed', 'Completed', 40, true),
  ('job', 'cancelled', 'Cancelled', 50, true),
  ('job', 'issue_reported', 'Issue reported', 60, false),
  ('run', 'planned', 'Planned', 10, false),
  ('run', 'dispatched', 'Dispatched', 20, false),
  ('run', 'started', 'Started', 30, false),
  ('run', 'loading', 'Loading', 40, false),
  ('run', 'enroute', 'Enroute', 50, false),
  ('run', 'delivered', 'Delivered', 60, false),
  ('run', 'completed', 'Completed', 70, true)
on conflict (tenant_id, organization_id, entity_type, key) do nothing;
