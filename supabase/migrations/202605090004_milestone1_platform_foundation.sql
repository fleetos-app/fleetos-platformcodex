alter table public.audit_logs
alter column tenant_id drop not null;

alter table public.organizations
add column if not exists status text not null default 'active'
  check (status in ('active', 'suspended', 'archived')),
add column if not exists plan_key text not null default 'starter',
add column if not exists billing_status text not null default 'trial'
  check (billing_status in ('trial', 'active', 'past_due', 'paused', 'cancelled')),
add column if not exists plan_limits jsonb not null default '{"trucks":25,"users":10,"jobs_per_month":1000}'::jsonb;

create table public.platform_super_admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id),
  unique (email)
);

create table public.support_access_sessions (
  id uuid primary key default gen_random_uuid(),
  super_admin_user_id uuid not null references auth.users(id) on delete cascade,
  target_user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  reason text not null,
  status text not null default 'active' check (status in ('active', 'ended', 'revoked')),
  expires_at timestamptz not null default (now() + interval '30 minutes'),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index organizations_status_idx on public.organizations(status);
create index organizations_plan_key_idx on public.organizations(plan_key);
create index organizations_billing_status_idx on public.organizations(billing_status);
create index platform_super_admins_user_id_idx on public.platform_super_admins(user_id);
create index platform_super_admins_status_idx on public.platform_super_admins(status);
create index support_access_sessions_super_admin_user_id_idx on public.support_access_sessions(super_admin_user_id);
create index support_access_sessions_target_user_id_idx on public.support_access_sessions(target_user_id);
create index support_access_sessions_organization_id_idx on public.support_access_sessions(organization_id);
create index support_access_sessions_status_idx on public.support_access_sessions(status);

create trigger set_platform_super_admins_updated_at
before update on public.platform_super_admins
for each row execute function public.set_updated_at();

create trigger set_support_access_sessions_updated_at
before update on public.support_access_sessions
for each row execute function public.set_updated_at();

alter table public.platform_super_admins enable row level security;
alter table public.support_access_sessions enable row level security;

insert into public.permissions (key, name, description)
values
  ('jobs.read', 'Read jobs', 'View jobs for an organization.'),
  ('jobs.write', 'Write jobs', 'Create and update jobs for an organization.'),
  ('runs.read', 'Read runs', 'View runs for an organization.'),
  ('runs.write', 'Write runs', 'Create and update runs for an organization.')
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
  and permissions.key in ('jobs.read', 'jobs.write', 'runs.read', 'runs.write')
on conflict (role_id, permission_id) do nothing;

insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from public.roles
join public.permissions on permissions.key in ('jobs.read', 'jobs.write', 'runs.read', 'runs.write')
where roles.tenant_id is null
  and permissions.tenant_id is null
  and roles.key = 'ops_manager'
on conflict (role_id, permission_id) do nothing;

insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from public.roles
join public.permissions on permissions.key in ('jobs.read', 'runs.read')
where roles.tenant_id is null
  and permissions.tenant_id is null
  and roles.key in ('accounts', 'driver', 'subcontractor', 'mechanic')
on conflict (role_id, permission_id) do nothing;

insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from public.roles
join public.permissions on permissions.key = 'jobs.read'
where roles.tenant_id is null
  and permissions.tenant_id is null
  and roles.key = 'client'
on conflict (role_id, permission_id) do nothing;
