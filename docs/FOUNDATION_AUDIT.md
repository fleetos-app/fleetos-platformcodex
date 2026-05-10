# FleetOS Foundation Audit

Date: 2026-05-09

Scope: foundation hardening only. No billing, GPS, AI, portal, mobile app, or new logistics modules were added.

## Executive Summary

FleetOS is structurally sound for a V1 SaaS foundation: the app uses a modular Next.js monorepo, central auth/RBAC packages, strict organization tenancy, RLS-backed Supabase tables, protected app routes, and a separate platform super admin layer.

The hardening pass focused on removing foundation drift, adding regression tests, and documenting the operational setup required for a serious SaaS baseline.

## Architecture Findings

The workspace boundaries are clean:

- `apps/web` owns the Next.js application, route groups, modules, and shell.
- `packages/auth` owns server-side auth session, membership, and guard helpers.
- `packages/rbac` owns role and permission definitions.
- `packages/database` owns database type boundaries.
- `packages/tenant-router` is kept ready for future routing expansion without implementing enterprise routing in V1.
- `packages/ui` contains reusable UI primitives.

No package dependency cycle is expected or allowed. A static test now checks this.

Old generated-code references were removed from planning docs, and an unused placeholder component was deleted.

## Auth And Security Findings

Server-side authorization uses `supabase.auth.getUser()` through the auth helper stack. The remaining `getSession()` usage is limited to the client auth provider, where it is used for browser session display and subscription handling rather than authorization.

Protected route behavior:

- `/app` routes call `getRequiredAuthSession()` server-side.
- The app layout blocks authenticated users with no active organization membership.
- Permission checks go through `guardPermission()`.
- Platform admin pages call `requireSuperAdmin()` and query `platform_super_admins`.
- Organization roles cannot grant `/admin` access.

Service-role access is isolated in `apps/web/lib/supabase/admin.ts` and now imports `server-only`. Static tests check that client components do not import the service-role helper or reference service-role secrets.

## Database Findings

The core schema supports V1 shared-Supabase tenancy:

- `platform_tenants`
- `organizations`
- `organization_memberships`
- `platform_super_admins`
- `roles`
- `permissions`
- `role_permissions`
- `audit_logs`
- `drivers`
- `subcontractors`
- `vehicles`
- `customers`
- `pickup_locations`
- `delivery_locations`
- `jobs`
- `runs`
- `run_stops`
- `allocations`
- `status_history`

Tenant-owned operational tables include `tenant_id` and `organization_id`. RLS declarations and common indexes are present for the core tables. Composite foreign keys are used where needed to prevent cross-organization references.

Ambiguous Supabase embeds have explicit relationship names, including organization membership and Jobs/Runs relationships.

The seed file now avoids duplicate seed audit rows by using a deterministic audit-log ID with `on conflict`.

## Routing Findings

Navigation is centralized in `apps/web/lib/navigation.ts` and filtered by permissions in the app shell. A static test verifies that each navigation item resolves to a real app route.

The current foundation routes are:

- `/login`
- `/app/dashboard`
- `/app/control-tower`
- `/app/jobs`
- `/app/runs`
- `/app/fleet`
- `/app/users`
- `/app/settings`
- `/admin/organizations`
- `/admin/users`
- `/admin/billing`
- `/admin/support`
- `/admin/system-health`
- `/unauthorized`

## UI Findings

The app has a real SaaS shell rather than empty placeholders. Shared loading, empty, and error components are available. The no-membership state and unauthorized state are friendly and actionable.

One admin billing sentence was adjusted so it accurately describes the V1 boundary without presenting an unfinished payment integration as a product feature.

## Performance Findings

The foundation favors server-side route protection and scoped repository queries. UI components do not own authorization or database access. Enterprise routing and dedicated infrastructure logic remain deferred, which keeps V1 operational complexity low.

Recommended next performance checks before launch:

- Run a production build with bundle analysis if bundle size becomes a concern.
- Add query timing visibility around Jobs/Runs list pages once data volume grows.
- Add pagination/load testing with realistic 5-200 truck operator data.

## Test Coverage Added

New hardening tests cover:

- Navigation route existence.
- Protected app route gating.
- Platform admin guard usage.
- Service-role server-only isolation.
- Server authorization avoiding unsafe `getSession()` usage.
- Old generated-code reference cleanup.
- Workspace package cycle detection.
- Core database table/RLS/index declarations.
- Explicit PostgREST relationship embeds.
- Seed idempotency guardrails.
- RBAC role boundaries.

## Known Environment Limits

`supabase db reset` requires a running Docker Desktop/Supabase local stack. If Docker is unavailable on the current machine, use the static database tests as a precheck, then run the actual reset on a machine with Docker before merging or deploying.

Manual browser QA should be performed against a live local or hosted Supabase project to confirm:

- Login works.
- `/app/dashboard` loads after login.
- Organization switcher works for multiple memberships.
- `/admin` works only for active platform super admins.
- Browser console has no red runtime errors.

## Hardening Changes Made

- Added `server-only` to the service-role Supabase helper.
- Removed unused placeholder component.
- Removed old generated-tool references from planning docs.
- Cleaned settings membership separator to plain ASCII.
- Clarified admin billing V1 copy.
- Made the seed audit event idempotent.
- Added static foundation, database, and RBAC tests.
- Added `ENVIRONMENT.md`.
- Added `docs/FOUNDATION_CHECKLIST.md`.
- Added `docs/PRODUCTION_READINESS.md`.
