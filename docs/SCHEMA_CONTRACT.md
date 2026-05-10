# FleetOS Schema Contract

This document is the canonical V1 contract between Supabase migrations and application code. If code needs a field that is not listed here, add a migration first or refactor the code to use the intended table.

## Tenancy Rules

- Tenant-owned operational rows include `tenant_id`.
- Organization-owned operational rows include both `tenant_id` and `organization_id`.
- Application queries must scope by both `tenant_id` and `organization_id` when reading organization data.
- Supabase embeds must use explicit relationship names where multiple foreign keys exist.

## Users And Memberships

Canonical user source:

- Supabase Auth `auth.users`

Canonical organization access source:

- `organization_memberships`

Important columns:

- `id`
- `tenant_id`
- `organization_id`
- `user_id`
- `role_key`
- `status`
- `created_at`
- `updated_at`

Contract:

- Server authorization uses `supabase.auth.getUser()`.
- Organization access is resolved through active `organization_memberships`.
- Platform super admin access is resolved through `platform_super_admins`, never organization roles.

## Customers

Canonical table:

- `customers`

Important columns:

- `id`
- `tenant_id`
- `organization_id`
- `name`
- `email`
- `phone`
- `customer_reference`
- `metadata`
- `created_at`
- `updated_at`

Contract:

- Jobs reference customers through `jobs.customer_id`.
- Customer creation UI is not part of the current prototype.

## Jobs

Canonical table:

- `jobs`

Important columns:

- `id`
- `tenant_id`
- `organization_id`
- `customer_id`
- `pickup_location_id`
- `delivery_location_id`
- `status`
- `customer_reference`
- `internal_reference`
- `title`
- `notes`
- `requested_pickup_at`
- `requested_delivery_at`
- `temperature_min_c`
- `temperature_max_c`
- `pod_required`
- `created_by`
- `updated_by`
- `created_at`
- `updated_at`

Contract:

- Jobs are work/customer order records.
- Jobs do not own assignment columns.
- Do not query `jobs.driver_user_id`, `jobs.subcontractor_id`, or `jobs.vehicle_id`.
- Job assignment state comes from `allocations`.
- Job status history comes from `status_history`.

## Runs

Canonical table:

- `runs`

Important columns:

- `id`
- `tenant_id`
- `organization_id`
- `run_number`
- `title`
- `status`
- `planned_start_at`
- `planned_end_at`
- `actual_start_at`
- `actual_end_at`
- `driver_user_id`
- `subcontractor_id`
- `vehicle_id`
- `notes`
- `created_by`
- `updated_by`
- `created_at`
- `updated_at`

Contract:

- Runs may carry direct assignment columns for the run-level driver, subcontractor membership, and vehicle.
- Multi-stop detail lives in `run_stops`.
- Run status history comes from `status_history`.

## Allocations

Canonical table:

- `allocations`

Important columns:

- `id`
- `tenant_id`
- `organization_id`
- `job_id`
- `run_id`
- `driver_user_id`
- `subcontractor_id`
- `vehicle_id`
- `status`
- `notes`
- `created_by`
- `updated_by`
- `created_at`
- `updated_at`

Contract:

- Allocations connect jobs to runs and assignment resources.
- Current prototype edits the latest allocation for a job rather than writing assignment fields onto `jobs`.
- Future allocation history must be designed through a migration and service change.

## Drivers

Canonical table:

- `drivers`

Important columns:

- `id`
- `tenant_id`
- `organization_id`
- `user_id`
- `organization_membership_id`
- `display_name`
- `email`
- `phone`
- `license_number`
- `license_expiry_date`
- `status`
- `notes`
- `created_by`
- `updated_by`
- `created_at`
- `updated_at`

Contract:

- Driver assignment dropdowns use active driver records with a non-null `user_id`.
- Full driver profile management is not part of the current prototype.

## Subcontractors

Canonical table:

- `subcontractors`

Important columns:

- `id`
- `tenant_id`
- `organization_id`
- `organization_membership_id`
- `company_name`
- `contact_name`
- `email`
- `phone`
- `abn`
- `status`
- `notes`
- `created_by`
- `updated_by`
- `created_at`
- `updated_at`

Contract:

- Company records live in `subcontractors`.
- User-level subcontractor assignment uses `organization_memberships` with role `subcontractor`.
- Full subcontractor profile management is not part of the current prototype.

## Vehicles

Canonical table:

- `vehicles`

Important columns:

- `id`
- `tenant_id`
- `organization_id`
- `registration_number`
- `fleet_number`
- `name`
- `vehicle_type`
- `status`
- `refrigerated`
- `temperature_min_c`
- `temperature_max_c`
- `last_service_at`
- `next_service_due_at`
- `odometer_km`
- `notes`
- `created_by`
- `updated_by`
- `created_at`
- `updated_at`

Contract:

- Vehicle creation and edit forms write to `vehicles`.
- Duplicate registrations per organization are rejected through the unique constraint and mapped to a friendly UI message.

## Query Safety Rules

- Prefer repository functions for Supabase reads and writes.
- Never select columns that are not in this contract.
- Catch Supabase write errors at server-action boundaries and map them to friendly messages.
- Details pages may return friendly error or not-found states, but should not expose raw database errors.
