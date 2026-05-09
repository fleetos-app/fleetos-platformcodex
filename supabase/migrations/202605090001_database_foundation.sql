create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.platform_tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status text not null default 'active' check (status in ('active', 'suspended', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  name text not null,
  slug text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

create table public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'invited', 'suspended', 'removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.platform_tenants(id) on delete cascade,
  key text not null,
  name text not null,
  description text,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, key)
);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.platform_tenants(id) on delete cascade,
  key text not null,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, key)
);

create table public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.platform_tenants(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (role_id, permission_id)
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_table text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tenant_infrastructure (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  region text,
  supabase_project_ref text,
  database_host text,
  status text not null default 'provisioning' check (status in ('provisioning', 'active', 'degraded', 'suspended')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id)
);

create table public.tenant_domains (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  domain text not null unique,
  status text not null default 'pending' check (status in ('pending', 'verified', 'failed', 'disabled')),
  is_primary boolean not null default false,
  verification_token text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.feature_flags (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.platform_tenants(id) on delete cascade,
  key text not null,
  description text,
  enabled boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, key)
);

create table public.billing_plans (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.platform_tenants(id) on delete cascade,
  key text not null,
  name text not null,
  description text,
  price_cents integer not null default 0 check (price_cents >= 0),
  currency text not null default 'AUD',
  interval text not null default 'month' check (interval in ('month', 'year')),
  features jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, key)
);

create index platform_tenants_status_idx on public.platform_tenants(status);
create index organizations_tenant_id_idx on public.organizations(tenant_id);
create unique index organizations_tenant_id_id_idx on public.organizations(tenant_id, id);
create index organization_memberships_tenant_id_idx on public.organization_memberships(tenant_id);
create index organization_memberships_organization_id_idx on public.organization_memberships(organization_id);
create index organization_memberships_user_id_idx on public.organization_memberships(user_id);
create index roles_tenant_id_idx on public.roles(tenant_id);
create unique index roles_global_key_idx on public.roles(key) where tenant_id is null;
create index permissions_tenant_id_idx on public.permissions(tenant_id);
create unique index permissions_global_key_idx on public.permissions(key) where tenant_id is null;
create index role_permissions_tenant_id_idx on public.role_permissions(tenant_id);
create index role_permissions_role_id_idx on public.role_permissions(role_id);
create index role_permissions_permission_id_idx on public.role_permissions(permission_id);
create index audit_logs_tenant_id_idx on public.audit_logs(tenant_id);
create index audit_logs_organization_id_idx on public.audit_logs(organization_id);
create index audit_logs_actor_user_id_idx on public.audit_logs(actor_user_id);
create index tenant_infrastructure_tenant_id_idx on public.tenant_infrastructure(tenant_id);
create index tenant_domains_tenant_id_idx on public.tenant_domains(tenant_id);
create index feature_flags_tenant_id_idx on public.feature_flags(tenant_id);
create index billing_plans_tenant_id_idx on public.billing_plans(tenant_id);

create trigger set_platform_tenants_updated_at
before update on public.platform_tenants
for each row execute function public.set_updated_at();

create trigger set_organizations_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

create trigger set_organization_memberships_updated_at
before update on public.organization_memberships
for each row execute function public.set_updated_at();

create trigger set_roles_updated_at
before update on public.roles
for each row execute function public.set_updated_at();

create trigger set_permissions_updated_at
before update on public.permissions
for each row execute function public.set_updated_at();

create trigger set_role_permissions_updated_at
before update on public.role_permissions
for each row execute function public.set_updated_at();

create trigger set_audit_logs_updated_at
before update on public.audit_logs
for each row execute function public.set_updated_at();

create trigger set_tenant_infrastructure_updated_at
before update on public.tenant_infrastructure
for each row execute function public.set_updated_at();

create trigger set_tenant_domains_updated_at
before update on public.tenant_domains
for each row execute function public.set_updated_at();

create trigger set_feature_flags_updated_at
before update on public.feature_flags
for each row execute function public.set_updated_at();

create trigger set_billing_plans_updated_at
before update on public.billing_plans
for each row execute function public.set_updated_at();

alter table public.platform_tenants enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.audit_logs enable row level security;
alter table public.tenant_infrastructure enable row level security;
alter table public.tenant_domains enable row level security;
alter table public.feature_flags enable row level security;
alter table public.billing_plans enable row level security;

create or replace function public.current_tenant_ids()
returns uuid[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(distinct tenant_id), array[]::uuid[])
  from public.organization_memberships
  where user_id = auth.uid()
    and status = 'active';
$$;

create or replace function public.is_tenant_member(check_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select check_tenant_id = any(public.current_tenant_ids());
$$;

create policy "tenant members can read their tenants"
on public.platform_tenants
for select
to authenticated
using (public.is_tenant_member(id));

create policy "tenant members can read organizations"
on public.organizations
for select
to authenticated
using (public.is_tenant_member(tenant_id));

create policy "tenant members can read memberships"
on public.organization_memberships
for select
to authenticated
using (public.is_tenant_member(tenant_id));

create policy "tenant members can read roles"
on public.roles
for select
to authenticated
using (tenant_id is null or public.is_tenant_member(tenant_id));

create policy "tenant members can read permissions"
on public.permissions
for select
to authenticated
using (tenant_id is null or public.is_tenant_member(tenant_id));

create policy "tenant members can read role permissions"
on public.role_permissions
for select
to authenticated
using (tenant_id is null or public.is_tenant_member(tenant_id));

create policy "tenant members can read audit logs"
on public.audit_logs
for select
to authenticated
using (public.is_tenant_member(tenant_id));

create policy "tenant members can create audit logs"
on public.audit_logs
for insert
to authenticated
with check (public.is_tenant_member(tenant_id) and actor_user_id = auth.uid());

create policy "tenant members can read infrastructure"
on public.tenant_infrastructure
for select
to authenticated
using (public.is_tenant_member(tenant_id));

create policy "tenant members can read domains"
on public.tenant_domains
for select
to authenticated
using (public.is_tenant_member(tenant_id));

create policy "tenant members can read feature flags"
on public.feature_flags
for select
to authenticated
using (tenant_id is null or public.is_tenant_member(tenant_id));

create policy "tenant members can read billing plans"
on public.billing_plans
for select
to authenticated
using (tenant_id is null or public.is_tenant_member(tenant_id));

insert into public.roles (key, name, description, is_system)
values
  ('owner', 'Owner', 'Full tenant administration access.', true),
  ('admin', 'Admin', 'Administrative access for tenant operations.', true),
  ('member', 'Member', 'Standard authenticated tenant member access.', true)
on conflict (key) where tenant_id is null do nothing;

insert into public.permissions (key, name, description)
values
  ('tenant.read', 'Read tenant', 'View tenant profile and platform metadata.'),
  ('organization.read', 'Read organizations', 'View organizations within a tenant.'),
  ('membership.read', 'Read memberships', 'View organization membership records.'),
  ('role.read', 'Read roles', 'View roles available to a tenant.'),
  ('permission.read', 'Read permissions', 'View permissions available to a tenant.'),
  ('audit_log.read', 'Read audit logs', 'View tenant audit logs.'),
  ('audit_log.create', 'Create audit logs', 'Create tenant audit log entries.'),
  ('tenant_domain.read', 'Read tenant domains', 'View tenant domain configuration.'),
  ('tenant_infrastructure.read', 'Read tenant infrastructure', 'View tenant infrastructure metadata.'),
  ('feature_flag.read', 'Read feature flags', 'View feature flag configuration.'),
  ('billing_plan.read', 'Read billing plans', 'View available billing plans.')
on conflict (key) where tenant_id is null do nothing;

insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from public.roles
cross join public.permissions
where roles.tenant_id is null
  and permissions.tenant_id is null
  and roles.key = 'owner'
on conflict (role_id, permission_id) do nothing;

insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from public.roles
join public.permissions on permissions.key in (
  'tenant.read',
  'organization.read',
  'membership.read',
  'role.read',
  'permission.read',
  'audit_log.read',
  'audit_log.create',
  'tenant_domain.read',
  'tenant_infrastructure.read',
  'feature_flag.read',
  'billing_plan.read'
)
where roles.tenant_id is null
  and permissions.tenant_id is null
  and roles.key = 'admin'
on conflict (role_id, permission_id) do nothing;

insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from public.roles
join public.permissions on permissions.key in (
  'tenant.read',
  'organization.read',
  'membership.read',
  'role.read',
  'permission.read',
  'feature_flag.read',
  'billing_plan.read'
)
where roles.tenant_id is null
  and permissions.tenant_id is null
  and roles.key = 'member'
on conflict (role_id, permission_id) do nothing;
