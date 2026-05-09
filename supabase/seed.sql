-- FleetOS local development seed
--
-- Before running this file, create this user in Supabase Auth:
--   admin@fleetos.local
--
-- This script does not create Auth users. It looks up the existing
-- Supabase Auth user by email, then attaches that user to FleetOS data.

do $$
declare
  admin_user_id uuid;
  demo_tenant_id uuid;
  demo_organization_id uuid;
  demo_customer_id uuid := '40000000-0000-4000-8000-000000000101';
  demo_pickup_location_id uuid := '50000000-0000-4000-8000-000000000101';
  demo_delivery_location_id uuid := '60000000-0000-4000-8000-000000000101';
  demo_run_1_id uuid := '70000000-0000-4000-8000-000000000101';
  demo_run_2_id uuid := '70000000-0000-4000-8000-000000000102';
  demo_job_1_id uuid := '80000000-0000-4000-8000-000000000101';
  demo_job_2_id uuid := '80000000-0000-4000-8000-000000000102';
  demo_vehicle_1_id uuid := 'b0000000-0000-4000-8000-000000000101';
  demo_vehicle_2_id uuid := 'b0000000-0000-4000-8000-000000000102';
begin
  select id
  into admin_user_id
  from auth.users
  where lower(email) = 'admin@fleetos.local'
  limit 1;

  if admin_user_id is null then
    raise exception 'Missing Supabase Auth user: admin@fleetos.local. Create the user in Authentication > Users, then run this seed again.';
  end if;

  -- Default platform roles.
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

  -- Default platform permissions.
  insert into public.permissions (key, name, description)
  values
    ('tenant.read', 'Read tenant', 'View tenant profile and platform metadata.'),
    ('organization.read', 'Read organizations', 'View organizations within a tenant.'),
    ('membership.read', 'Read memberships', 'View organization membership records.'),
    ('role.read', 'Read roles', 'View roles available to a tenant.'),
    ('permission.read', 'Read permissions', 'View permissions available to a tenant.'),
    ('audit_log.read', 'Read audit logs', 'View tenant audit logs.'),
    ('audit_log.create', 'Create audit logs', 'Create tenant audit log entries.'),
    ('sensitive_access.read', 'Read sensitive access areas', 'Access sensitive platform administration areas.'),
    ('jobs.read', 'Read jobs', 'View jobs for an organization.'),
    ('jobs.write', 'Write jobs', 'Create and update jobs for an organization.'),
    ('runs.read', 'Read runs', 'View runs for an organization.'),
    ('runs.write', 'Write runs', 'Create and update runs for an organization.'),
    ('vehicles.read', 'Read vehicles', 'View fleet vehicles for an organization.'),
    ('vehicles.write', 'Write vehicles', 'Create and update fleet vehicles for an organization.'),
    ('users.read', 'Read users', 'View organization users and memberships.'),
    ('users.write', 'Write users', 'Invite and manage organization users.'),
    ('control_tower.read', 'Read control tower', 'View the operational control tower.')
  on conflict (key) where tenant_id is null do update
  set
    name = excluded.name,
    description = excluded.description;

  -- Role/permission defaults for V1.
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
    'sensitive_access.read',
    'jobs.read',
    'jobs.write',
    'runs.read',
    'runs.write',
    'vehicles.read',
    'vehicles.write',
    'users.read',
    'control_tower.read'
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
    'audit_log.create',
    'jobs.read',
    'runs.read',
    'vehicles.read'
  )
  where roles.tenant_id is null
    and permissions.tenant_id is null
    and roles.key in ('accounts', 'driver', 'subcontractor', 'mechanic')
  on conflict (role_id, permission_id) do nothing;

  insert into public.role_permissions (role_id, permission_id)
  select roles.id, permissions.id
  from public.roles
  join public.permissions on permissions.key = 'vehicles.write'
  where roles.tenant_id is null
    and permissions.tenant_id is null
    and roles.key = 'mechanic'
  on conflict (role_id, permission_id) do nothing;

  insert into public.role_permissions (role_id, permission_id)
  select roles.id, permissions.id
  from public.roles
  join public.permissions on permissions.key in ('tenant.read', 'organization.read', 'jobs.read')
  where roles.tenant_id is null
    and permissions.tenant_id is null
    and roles.key = 'client'
  on conflict (role_id, permission_id) do nothing;

  -- Demo tenant and organization.
  insert into public.platform_tenants (name, slug, status, metadata)
  values ('Jindal Transport', 'jindal-transport', 'active', '{"seed":"local-development"}'::jsonb)
  on conflict (slug) do update
  set
    name = excluded.name,
    status = excluded.status,
    metadata = excluded.metadata
  returning id into demo_tenant_id;

  insert into public.organizations (
    tenant_id,
    name,
    slug,
    status,
    plan_key,
    billing_status,
    plan_limits,
    metadata
  )
  values (
    demo_tenant_id,
    'Jindal Transport',
    'jindal-transport',
    'active',
    'starter',
    'trial',
    '{"trucks":25,"users":10,"jobs_per_month":1000}'::jsonb,
    '{"seed":"local-development"}'::jsonb
  )
  on conflict (tenant_id, slug) do update
  set
    name = excluded.name,
    status = excluded.status,
    plan_key = excluded.plan_key,
    billing_status = excluded.billing_status,
    plan_limits = excluded.plan_limits,
    metadata = excluded.metadata
  returning id into demo_organization_id;

  -- Make admin@fleetos.local the organization owner.
  insert into public.organization_memberships (
    tenant_id,
    organization_id,
    user_id,
    role_key,
    status
  )
  values (
    demo_tenant_id,
    demo_organization_id,
    admin_user_id,
    'owner',
    'active'
  )
  on conflict (organization_id, user_id) do update
  set
    tenant_id = excluded.tenant_id,
    role_key = excluded.role_key,
    status = excluded.status;

  -- Give the same user FleetOS internal super-admin access.
  insert into public.platform_super_admins (user_id, email, status)
  values (admin_user_id, 'admin@fleetos.local', 'active')
  on conflict (user_id) do update
  set
    email = excluded.email,
    status = excluded.status;

  -- Optional tenant infrastructure placeholder for future scaling visibility.
  insert into public.tenant_infrastructure (
    tenant_id,
    region,
    supabase_project_ref,
    status,
    metadata
  )
  values (
    demo_tenant_id,
    'shared-local',
    'shared-supabase-v1',
    'active',
    '{"note":"V1 shared Supabase project"}'::jsonb
  )
  on conflict (tenant_id) do update
  set
    region = excluded.region,
    supabase_project_ref = excluded.supabase_project_ref,
    status = excluded.status,
    metadata = excluded.metadata;

  -- Demo customer and locations.
  insert into public.customers (
    id,
    tenant_id,
    organization_id,
    name,
    email,
    phone,
    customer_reference,
    metadata
  )
  values (
    demo_customer_id,
    demo_tenant_id,
    demo_organization_id,
    'Harbour Fresh Foods',
    'ops@harbourfresh.example',
    '+61 2 5550 1100',
    'HFF',
    '{"temperature_sensitive":true}'::jsonb
  )
  on conflict (id) do update
  set
    tenant_id = excluded.tenant_id,
    organization_id = excluded.organization_id,
    name = excluded.name,
    email = excluded.email,
    phone = excluded.phone,
    customer_reference = excluded.customer_reference,
    metadata = excluded.metadata;

  insert into public.pickup_locations (
    id,
    tenant_id,
    organization_id,
    customer_id,
    name,
    address_line_1,
    suburb,
    state,
    postcode,
    contact_name,
    contact_phone,
    instructions
  )
  values (
    demo_pickup_location_id,
    demo_tenant_id,
    demo_organization_id,
    demo_customer_id,
    'Harbour Fresh Cold Store',
    '12 Cold Chain Drive',
    'Wetherill Park',
    'NSW',
    '2164',
    'Dispatch Desk',
    '+61 2 5550 1101',
    'Use dock 3. Temperature check required before loading.'
  )
  on conflict (id) do update
  set
    tenant_id = excluded.tenant_id,
    organization_id = excluded.organization_id,
    customer_id = excluded.customer_id,
    name = excluded.name,
    address_line_1 = excluded.address_line_1,
    suburb = excluded.suburb,
    state = excluded.state,
    postcode = excluded.postcode,
    contact_name = excluded.contact_name,
    contact_phone = excluded.contact_phone,
    instructions = excluded.instructions;

  insert into public.delivery_locations (
    id,
    tenant_id,
    organization_id,
    customer_id,
    name,
    address_line_1,
    suburb,
    state,
    postcode,
    contact_name,
    contact_phone,
    instructions
  )
  values (
    demo_delivery_location_id,
    demo_tenant_id,
    demo_organization_id,
    demo_customer_id,
    'Sydney Metro Retail DC',
    '88 Market Street',
    'Sydney',
    'NSW',
    '2000',
    'Receiving',
    '+61 2 5550 2100',
    'Call 20 minutes before arrival.'
  )
  on conflict (id) do update
  set
    tenant_id = excluded.tenant_id,
    organization_id = excluded.organization_id,
    customer_id = excluded.customer_id,
    name = excluded.name,
    address_line_1 = excluded.address_line_1,
    suburb = excluded.suburb,
    state = excluded.state,
    postcode = excluded.postcode,
    contact_name = excluded.contact_name,
    contact_phone = excluded.contact_phone,
    instructions = excluded.instructions;

  -- Organization-specific job/run statuses.
  insert into public.statuses (tenant_id, organization_id, entity_type, key, label, sort_order, is_terminal)
  values
    (demo_tenant_id, demo_organization_id, 'job', 'pending', 'Pending', 10, false),
    (demo_tenant_id, demo_organization_id, 'job', 'allocated', 'Allocated', 20, false),
    (demo_tenant_id, demo_organization_id, 'job', 'in_progress', 'In progress', 30, false),
    (demo_tenant_id, demo_organization_id, 'job', 'completed', 'Completed', 40, true),
    (demo_tenant_id, demo_organization_id, 'job', 'cancelled', 'Cancelled', 50, true),
    (demo_tenant_id, demo_organization_id, 'job', 'issue_reported', 'Issue reported', 60, false),
    (demo_tenant_id, demo_organization_id, 'run', 'planned', 'Planned', 10, false),
    (demo_tenant_id, demo_organization_id, 'run', 'dispatched', 'Dispatched', 20, false),
    (demo_tenant_id, demo_organization_id, 'run', 'started', 'Started', 30, false),
    (demo_tenant_id, demo_organization_id, 'run', 'loading', 'Loading', 40, false),
    (demo_tenant_id, demo_organization_id, 'run', 'enroute', 'Enroute', 50, false),
    (demo_tenant_id, demo_organization_id, 'run', 'delivered', 'Delivered', 60, false),
    (demo_tenant_id, demo_organization_id, 'run', 'completed', 'Completed', 70, true)
  on conflict (tenant_id, organization_id, entity_type, key) do update
  set
    label = excluded.label,
    sort_order = excluded.sort_order,
    is_terminal = excluded.is_terminal;

  -- Sample vehicles.
  insert into public.vehicles (
    id,
    tenant_id,
    organization_id,
    registration_number,
    fleet_number,
    name,
    vehicle_type,
    status,
    refrigerated,
    temperature_min_c,
    temperature_max_c,
    next_service_due_at,
    odometer_km,
    notes,
    created_by,
    updated_by
  )
  values
    (
      demo_vehicle_1_id,
      demo_tenant_id,
      demo_organization_id,
      'JT-001',
      'TRUCK-JT-01',
      'Jindal Prime Mover 01',
      'truck',
      'allocated',
      true,
      0,
      4,
      now() + interval '30 days',
      182450,
      'Primary chilled metro truck.',
      admin_user_id,
      admin_user_id
    ),
    (
      demo_vehicle_2_id,
      demo_tenant_id,
      demo_organization_id,
      'JT-002',
      'TRUCK-JT-02',
      'Jindal Freezer Truck 02',
      'truck',
      'available',
      true,
      -22,
      -18,
      now() + interval '45 days',
      96420,
      'Frozen freight capable.',
      admin_user_id,
      admin_user_id
    )
  on conflict (tenant_id, organization_id, registration_number) do update
  set
    fleet_number = excluded.fleet_number,
    name = excluded.name,
    vehicle_type = excluded.vehicle_type,
    status = excluded.status,
    refrigerated = excluded.refrigerated,
    temperature_min_c = excluded.temperature_min_c,
    temperature_max_c = excluded.temperature_max_c,
    next_service_due_at = excluded.next_service_due_at,
    odometer_km = excluded.odometer_km,
    notes = excluded.notes,
    updated_by = excluded.updated_by;

  -- Sample runs.
  insert into public.runs (
    id,
    tenant_id,
    organization_id,
    run_number,
    title,
    status,
    planned_start_at,
    planned_end_at,
    vehicle_id,
    notes,
    created_by,
    updated_by
  )
  values
    (
      demo_run_1_id,
      demo_tenant_id,
      demo_organization_id,
      'RUN-JT-001',
      'Sydney chilled metro run',
      'planned',
      now() + interval '1 day',
      now() + interval '1 day 6 hours',
      demo_vehicle_1_id,
      'Keep trailer between 0C and 4C.',
      admin_user_id,
      admin_user_id
    ),
    (
      demo_run_2_id,
      demo_tenant_id,
      demo_organization_id,
      'RUN-JT-002',
      'Western Sydney frozen run',
      'dispatched',
      now() + interval '2 days',
      now() + interval '2 days 5 hours',
      demo_vehicle_2_id,
      'Frozen freight. Confirm loading bay before arrival.',
      admin_user_id,
      admin_user_id
    )
  on conflict (tenant_id, organization_id, run_number) do update
  set
    title = excluded.title,
    status = excluded.status,
    planned_start_at = excluded.planned_start_at,
    planned_end_at = excluded.planned_end_at,
    vehicle_id = excluded.vehicle_id,
    notes = excluded.notes,
    updated_by = excluded.updated_by;

  -- Sample jobs.
  insert into public.jobs (
    id,
    tenant_id,
    organization_id,
    customer_id,
    pickup_location_id,
    delivery_location_id,
    status,
    customer_reference,
    internal_reference,
    title,
    notes,
    requested_pickup_at,
    requested_delivery_at,
    temperature_min_c,
    temperature_max_c,
    pod_required,
    created_by,
    updated_by
  )
  values
    (
      demo_job_1_id,
      demo_tenant_id,
      demo_organization_id,
      demo_customer_id,
      demo_pickup_location_id,
      demo_delivery_location_id,
      'allocated',
      'HFF-1001',
      'JT-JOB-0001',
      'Chilled pallet delivery',
      'Two pallets. Receiver requires POD photo.',
      now() + interval '1 day',
      now() + interval '1 day 4 hours',
      0,
      4,
      true,
      admin_user_id,
      admin_user_id
    ),
    (
      demo_job_2_id,
      demo_tenant_id,
      demo_organization_id,
      demo_customer_id,
      demo_pickup_location_id,
      demo_delivery_location_id,
      'pending',
      'HFF-1002',
      'JT-JOB-0002',
      'Frozen carton delivery',
      'Confirm freezer dock availability.',
      now() + interval '2 days',
      now() + interval '2 days 3 hours',
      -22,
      -18,
      true,
      admin_user_id,
      admin_user_id
    )
  on conflict (id) do update
  set
    tenant_id = excluded.tenant_id,
    organization_id = excluded.organization_id,
    customer_id = excluded.customer_id,
    pickup_location_id = excluded.pickup_location_id,
    delivery_location_id = excluded.delivery_location_id,
    status = excluded.status,
    customer_reference = excluded.customer_reference,
    internal_reference = excluded.internal_reference,
    title = excluded.title,
    notes = excluded.notes,
    requested_pickup_at = excluded.requested_pickup_at,
    requested_delivery_at = excluded.requested_delivery_at,
    temperature_min_c = excluded.temperature_min_c,
    temperature_max_c = excluded.temperature_max_c,
    pod_required = excluded.pod_required,
    updated_by = excluded.updated_by;

  -- Sample run stops.
  insert into public.run_stops (
    tenant_id,
    organization_id,
    run_id,
    job_id,
    stop_type,
    sequence,
    location_name,
    address_line_1,
    suburb,
    state,
    postcode,
    planned_arrival_at,
    planned_departure_at
  )
  values
    (demo_tenant_id, demo_organization_id, demo_run_1_id, demo_job_1_id, 'pickup', 1, 'Harbour Fresh Cold Store', '12 Cold Chain Drive', 'Wetherill Park', 'NSW', '2164', now() + interval '1 day', now() + interval '1 day 30 minutes'),
    (demo_tenant_id, demo_organization_id, demo_run_1_id, demo_job_1_id, 'delivery', 2, 'Sydney Metro Retail DC', '88 Market Street', 'Sydney', 'NSW', '2000', now() + interval '1 day 3 hours', now() + interval '1 day 4 hours'),
    (demo_tenant_id, demo_organization_id, demo_run_2_id, demo_job_2_id, 'pickup', 1, 'Harbour Fresh Cold Store', '12 Cold Chain Drive', 'Wetherill Park', 'NSW', '2164', now() + interval '2 days', now() + interval '2 days 30 minutes'),
    (demo_tenant_id, demo_organization_id, demo_run_2_id, demo_job_2_id, 'delivery', 2, 'Sydney Metro Retail DC', '88 Market Street', 'Sydney', 'NSW', '2000', now() + interval '2 days 2 hours', now() + interval '2 days 3 hours')
  on conflict (run_id, sequence) do update
  set
    job_id = excluded.job_id,
    stop_type = excluded.stop_type,
    location_name = excluded.location_name,
    address_line_1 = excluded.address_line_1,
    suburb = excluded.suburb,
    state = excluded.state,
    postcode = excluded.postcode,
    planned_arrival_at = excluded.planned_arrival_at,
    planned_departure_at = excluded.planned_departure_at;

  -- Sample allocations.
  insert into public.allocations (
    id,
    tenant_id,
    organization_id,
    job_id,
    run_id,
    vehicle_id,
    status,
    notes,
    created_by,
    updated_by
  )
  values
    ('90000000-0000-4000-8000-000000000101', demo_tenant_id, demo_organization_id, demo_job_1_id, demo_run_1_id, demo_vehicle_1_id, 'allocated', 'Seed allocation for chilled pallet delivery.', admin_user_id, admin_user_id),
    ('90000000-0000-4000-8000-000000000102', demo_tenant_id, demo_organization_id, demo_job_2_id, demo_run_2_id, demo_vehicle_2_id, 'allocated', 'Seed allocation for frozen carton delivery.', admin_user_id, admin_user_id)
  on conflict (id) do update
  set
    tenant_id = excluded.tenant_id,
    organization_id = excluded.organization_id,
    job_id = excluded.job_id,
    run_id = excluded.run_id,
    vehicle_id = excluded.vehicle_id,
    status = excluded.status,
    notes = excluded.notes,
    updated_by = excluded.updated_by;

  -- Sample status history.
  insert into public.status_history (
    id,
    tenant_id,
    organization_id,
    entity_type,
    entity_id,
    from_status,
    to_status,
    changed_by,
    reason,
    metadata
  )
  values
    ('a0000000-0000-4000-8000-000000000101', demo_tenant_id, demo_organization_id, 'job', demo_job_1_id, null, 'pending', admin_user_id, 'Seeded job created.', '{}'::jsonb),
    ('a0000000-0000-4000-8000-000000000102', demo_tenant_id, demo_organization_id, 'job', demo_job_1_id, 'pending', 'allocated', admin_user_id, 'Seeded job allocated to run.', '{}'::jsonb),
    ('a0000000-0000-4000-8000-000000000103', demo_tenant_id, demo_organization_id, 'run', demo_run_1_id, null, 'planned', admin_user_id, 'Seeded run created.', '{}'::jsonb)
  on conflict (id) do update
  set
    tenant_id = excluded.tenant_id,
    organization_id = excluded.organization_id,
    entity_type = excluded.entity_type,
    entity_id = excluded.entity_id,
    from_status = excluded.from_status,
    to_status = excluded.to_status,
    changed_by = excluded.changed_by,
    reason = excluded.reason,
    metadata = excluded.metadata;

  insert into public.audit_logs (
    tenant_id,
    organization_id,
    actor_user_id,
    action,
    entity_table,
    metadata
  )
  values (
    demo_tenant_id,
    demo_organization_id,
    admin_user_id,
    'seed.local_development',
    'seed',
    '{"organization":"Jindal Transport","user":"admin@fleetos.local"}'::jsonb
  );
end $$;
