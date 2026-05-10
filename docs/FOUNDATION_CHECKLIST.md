# FleetOS Foundation Checklist

This checklist is the standing hardening gate before FleetOS adds more product modules.

## Architecture

- [x] Monorepo uses `apps/*` and `packages/*` through pnpm workspaces.
- [x] Web app lives in `apps/web`.
- [x] Database, auth, RBAC, tenant routing, UI, and config packages are separated.
- [x] Feature modules keep pages thin, business logic in services, and database access in repositories.
- [x] Static test coverage checks workspace package dependency cycles.
- [x] Old generated code references are not retained in active source or docs.
- [x] Unused placeholder component system was removed.

## Auth And Security

- [x] Server-side authorization uses `supabase.auth.getUser()`.
- [x] Client auth provider may use `getSession()` only for client session display state.
- [x] `/app` routes are gated by server-side auth.
- [x] `/app` shell blocks users with no active organization membership.
- [x] `/admin` data routes call `requireSuperAdmin()` server-side.
- [x] Platform super admin access is controlled by `platform_super_admins`, not organization roles.
- [x] Service-role Supabase client is marked `server-only`.
- [x] Client components are statically checked for service-role leakage.
- [x] Unauthorized and no-membership states are friendly pages, not raw runtime crashes.

## Database

- [x] Core tables exist: `organizations`, `organization_memberships`, `drivers`, `subcontractors`, `vehicles`, `customers`, `jobs`, `runs`, `allocations`, and `audit_logs`.
- [x] Organization-owned tables carry both `tenant_id` and `organization_id`.
- [x] RLS is enabled on core tenant-owned tables.
- [x] Common tenant, organization, user, status, and FK access paths are indexed.
- [x] Ambiguous PostgREST embeds use explicit relationship names.
- [x] Seed data uses deterministic UUIDs and real IDs resolved during seed execution.
- [x] Seed data is safe to rerun, including the seed audit event.
- [ ] `supabase db reset` must be rerun on a machine with Docker Desktop available before production deployment.

## Routing

- [x] Permission-aware app navigation points to real `/app` routes.
- [x] Login preserves safe `next` redirects.
- [x] Logout route exists.
- [x] Unauthorized route exists.
- [x] Organization switching is centralized in `/app/switch-organization`.
- [x] Admin route group is separate from the organization app route group.

## UI Quality

- [x] App shell has sidebar, top nav, organization switcher, user menu, and sign out.
- [x] Loading, error, and empty states use shared reusable components.
- [x] Dashboard, control tower, jobs, runs, fleet, users, settings, and admin pages are real foundation surfaces.
- [x] Theme support is centralized through the app provider and CSS variables.
- [x] Mobile layout is supported by responsive shell CSS.
- [x] Admin billing copy avoids misleading feature claims.

## Performance

- [x] Protected route gates are server-side.
- [x] Service/repository split avoids database calls in UI components.
- [x] Navigation permissions are filtered from central session state.
- [x] Supabase queries use scoped tenant and organization filters.
- [x] Large enterprise routing and dedicated infrastructure logic are deferred.

## Testing

- [x] Jobs/Runs service tests cover pagination, organization scope, and temperature validation.
- [x] Super admin access tests cover active and suspended records.
- [x] RBAC tests cover role permission boundaries.
- [x] Static route/security tests cover protected routes, admin guards, service-role leakage, and package cycles.
- [x] Database foundation tests cover core tables, RLS declarations, indexes, explicit embeds, and seed idempotency.
- [ ] Browser console check should be run during manual QA against a live local or hosted Supabase project.

## Developer Experience

- [x] `README.md` includes workspace, setup, seed, and quality gate commands.
- [x] `SEEDING.md` includes exact Supabase SQL Editor instructions.
- [x] `TESTING.md` reflects current demo credentials and hardening tests.
- [x] `ENVIRONMENT.md` documents local and hosted Supabase setup.
- [x] `DATABASE.md` documents schema relationships and reset order.
- [x] `docs/PRODUCTION_READINESS.md` defines the production gate.
