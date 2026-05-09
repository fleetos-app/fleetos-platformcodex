# Testing FleetOS

Run the core checks from the repository root:

```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
```

The web app uses Vitest for core logic tests. Current tests cover Jobs/Runs service validation and super-admin access checks.

For local manual testing:

1. Start Supabase locally.
2. Apply migrations and seed data.
3. Start the app with `corepack pnpm dev`.
4. Sign in as `owner@fleetos.local` with `FleetOSDemo123!`.
5. Visit `/app/dashboard`, `/app/jobs`, `/app/runs`, and `/app/settings`.
6. Sign in as `superadmin@fleetos.local` with `FleetOSAdmin123!` and visit `/admin/organizations`.
