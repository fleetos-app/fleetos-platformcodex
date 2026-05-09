alter table public.organization_memberships
add column if not exists role_key text not null default 'member';

alter table public.organization_memberships
drop constraint if exists organization_memberships_role_key_check;

alter table public.organization_memberships
add constraint organization_memberships_role_key_check
check (
  role_key in (
    'owner',
    'admin',
    'ops_manager',
    'accounts',
    'driver',
    'subcontractor',
    'client',
    'mechanic'
  )
);

create index if not exists organization_memberships_role_key_idx
on public.organization_memberships(role_key);

insert into public.roles (key, name, description, is_system)
values
  ('owner', 'Owner', 'Full tenant administration access.', true),
  ('admin', 'Admin', 'Administrative access for tenant operations.', true),
  ('ops_manager', 'Operations Manager', 'Operational management access without ownership controls.', true),
  ('accounts', 'Accounts', 'Finance and account operations access without billing implementation.', true),
  ('driver', 'Driver', 'Driver portal access foundation.', true),
  ('subcontractor', 'Subcontractor', 'Subcontractor portal access foundation.', true),
  ('client', 'Client', 'Client portal access foundation.', true),
  ('mechanic', 'Mechanic', 'Maintenance portal access foundation.', true)
on conflict (key) where tenant_id is null do update
set
  name = excluded.name,
  description = excluded.description,
  is_system = excluded.is_system;

insert into public.permissions (key, name, description)
values
  ('tenant.read', 'Read tenant', 'View tenant profile and platform metadata.'),
  ('organization.read', 'Read organizations', 'View organizations within a tenant.'),
  ('membership.read', 'Read memberships', 'View organization membership records.'),
  ('role.read', 'Read roles', 'View roles available to a tenant.'),
  ('permission.read', 'Read permissions', 'View permissions available to a tenant.'),
  ('audit_log.read', 'Read audit logs', 'View tenant audit logs.'),
  ('audit_log.create', 'Create audit logs', 'Create tenant audit log entries.'),
  ('sensitive_access.read', 'Read sensitive access areas', 'Access sensitive platform administration areas.')
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
  'audit_log.create',
  'sensitive_access.read'
)
where roles.tenant_id is null
  and permissions.tenant_id is null
  and roles.key = 'ops_manager'
on conflict (role_id, permission_id) do nothing;

insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from public.roles
join public.permissions on permissions.key in (
  'tenant.read',
  'organization.read',
  'membership.read',
  'audit_log.create'
)
where roles.tenant_id is null
  and permissions.tenant_id is null
  and roles.key = 'accounts'
on conflict (role_id, permission_id) do nothing;

insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from public.roles
join public.permissions on permissions.key in (
  'tenant.read',
  'organization.read',
  'audit_log.create'
)
where roles.tenant_id is null
  and permissions.tenant_id is null
  and roles.key in ('driver', 'subcontractor', 'mechanic')
on conflict (role_id, permission_id) do nothing;

insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from public.roles
join public.permissions on permissions.key in (
  'tenant.read',
  'organization.read'
)
where roles.tenant_id is null
  and permissions.tenant_id is null
  and roles.key = 'client'
on conflict (role_id, permission_id) do nothing;
