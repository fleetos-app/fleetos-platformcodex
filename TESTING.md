# Testing FleetOS

Run the core checks from the repository root:

```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
```

For manual working-prototype smoke testing, follow [docs/PROTOTYPE_TEST_CHECKLIST.md](docs/PROTOTYPE_TEST_CHECKLIST.md).

The web app uses Vitest for core logic and foundation smoke tests. Current tests cover:

- Jobs/Runs service validation
- super-admin access checks
- RBAC role boundaries
- protected route and admin guard static checks
- service-role leakage checks
- workspace package cycle checks
- database foundation and seed idempotency checks

For local manual testing:

1. Start Supabase locally.
2. Apply migrations and seed data.
3. Start the app with `corepack pnpm dev`.
4. Sign in as `admin@fleetos.local` with `Password123!`.
5. Visit `/app/dashboard`, `/app/jobs`, `/app/runs`, and `/app/settings`.
6. Visit `/admin/organizations`, `/admin/users`, `/admin/billing`, `/admin/support`, and `/admin/system-health`.
7. Sign out and confirm protected app routes redirect back to `/login`.
