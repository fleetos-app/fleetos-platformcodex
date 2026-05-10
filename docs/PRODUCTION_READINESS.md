# FleetOS Production Readiness

FleetOS V1 should not move to production until every item in this document is satisfied or explicitly accepted as a known risk.

## Release Boundary

Production V1 uses:

- One shared Supabase project.
- Organization-based tenancy.
- Strict RLS.
- Email-based onboarding.
- Centralized RBAC.
- Server-side route protection.
- Platform super admin access separate from organization roles.

Production V1 does not include:

- SaaS billing implementation.
- Live GPS.
- AI automation.
- Client portal.
- Driver mobile app.
- Dedicated per-tenant infrastructure routing.

## Security Gate

Required:

- `SUPABASE_SERVICE_ROLE_KEY` exists only in server environment variables.
- Client bundles do not reference service-role secrets.
- All server authorization uses trusted Supabase user validation with `auth.getUser()`.
- `/app` access requires an active organization membership.
- `/admin` access requires an active `platform_super_admins` row.
- Normal organization roles cannot access platform admin routes.
- RLS is enabled on tenant-owned tables.
- Audit logs are written for sensitive access and platform admin actions.
- Supabase Auth redirect URLs are allow-listed for production domains.
- Production database credentials are not reused in local development.

Recommended:

- Rotate service-role keys before launch.
- Enable MFA for FleetOS internal platform super admins.
- Keep a break-glass super admin procedure outside the app.
- Review Supabase Auth email templates before inviting customers.

## Database Gate

Before production:

```bash
supabase db reset
corepack pnpm test
```

For hosted Supabase:

1. Apply migrations in timestamp order.
2. Confirm all tables exist.
3. Confirm RLS is enabled.
4. Confirm seed or admin bootstrap creates one internal platform super admin.
5. Confirm demo/local seed users are not present in production unless intentionally used for a sandbox.

Backups:

- Enable Supabase automated backups.
- Confirm point-in-time recovery availability for the chosen plan.
- Document restore ownership and response time.

## Application Gate

Required commands:

```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
```

Manual smoke checks:

- Visit `/login`.
- Sign in as an organization owner.
- Confirm redirect to `/app/dashboard`.
- Open Jobs, Runs, Fleet, Users, and Settings.
- Sign out and confirm protected routes redirect to login.
- Sign in as an active platform super admin.
- Open `/admin/organizations`, `/admin/users`, `/admin/billing`, `/admin/support`, and `/admin/system-health`.
- Confirm a normal organization admin cannot access `/admin`.
- Check browser console for red errors.
- Check server logs for red errors.

## Hosting Gate

Set production environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
FLEETOS_APP_URL=
```

Deployment requirements:

- Node runtime compatible with Next.js 15.
- Server-side environment variables available to route handlers and server components.
- HTTPS enforced.
- Production domain configured in Supabase Auth redirect URLs.
- Logs retained for troubleshooting auth, RLS, and server action failures.

## Observability Gate

Minimum before launch:

- Hosting provider request/error logs enabled.
- Supabase Postgres logs available.
- Supabase Auth logs available.
- Manual audit-log review path available through platform admin or SQL.

Recommended after first pilots:

- Error reporting service.
- Uptime checks for login and dashboard.
- Query performance dashboard for Jobs/Runs tables.
- Alerting for elevated auth failures and database errors.

## Operational Gate

Before inviting real operators:

- Create production platform super admin users manually.
- Create the first customer organization manually or through an audited admin flow.
- Confirm each invited user has exactly the intended role.
- Confirm organization suspension blocks access where expected.
- Confirm seed/demo data is not mixed with production tenant data.

## Rollback And Recovery

For application deployments:

- Keep the previous deployment available for quick rollback.
- Do not deploy destructive migrations without a tested rollback or forward-fix plan.

For database changes:

- Use migrations only.
- Back up before risky schema changes.
- Never edit production schema manually without recording the final migration.

## Current Readiness Status

Current foundation status: hardening in progress.

Ready for production pilot only after:

- Local or hosted Supabase migration reset has been verified.
- Manual browser QA has confirmed login, dashboard, organization access, and admin access.
- All pnpm quality gates pass.
- Production secrets and Auth redirect URLs are configured.
