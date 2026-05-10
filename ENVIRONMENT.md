# FleetOS Environment Setup

FleetOS V1 runs as a modular Next.js app backed by one shared Supabase project. Local and hosted environments use the same schema, RLS model, seed file, and RBAC rules.

## Required Tools

- Node.js 24 or the active LTS used by the team
- Corepack enabled
- pnpm through Corepack
- Supabase CLI
- Docker Desktop for local Supabase

Enable Corepack if it is not already enabled:

```bash
corepack enable
```

## Environment Variables

Copy the example file:

```bash
cp .env.example .env.local
```

Required values:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
FLEETOS_APP_URL=http://localhost:3000
```

Rules:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are safe for browser use.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be exposed to client components or browser bundles.
- Hosted deployments must set the same variables in the hosting provider secret manager.
- Production should use production Supabase project values only; do not reuse local keys.

## Local Development From Zero

Install dependencies:

```bash
corepack pnpm install
```

Start Docker Desktop, then reset the local Supabase database:

```bash
supabase db reset
```

Run the app:

```bash
corepack pnpm dev
```

Open:

```text
http://localhost:3000/login
```

Local demo credentials after `supabase db reset`:

```text
Email: admin@fleetos.local
Password: Password123!
```

The seeded user is both the Jindal Transport organization owner and a FleetOS platform super admin.

## Hosted Supabase Setup

1. Create a Supabase project.
2. Copy `Project URL`, `anon public key`, and `service_role secret key`.
3. Add those values to `.env.local` for local app development against hosted Supabase.
4. Apply every file in `supabase/migrations` in timestamp order, or link the Supabase CLI project and run the migration workflow approved by the team.
5. In Supabase Auth, create or confirm `admin@fleetos.local`.
6. Run `supabase/seed.sql` in the Supabase SQL Editor.
7. Configure Auth redirect URLs:
   - `http://localhost:3000/auth/callback`
   - hosted app callback URL, for example `https://app.example.com/auth/callback`
8. Start the app and sign in.

For exact SQL Editor steps, see [SEEDING.md](SEEDING.md).

## Quality Gates

Run from the repository root:

```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
```

Run a database reset when Docker and Supabase CLI are available:

```bash
supabase db reset
```

## Troubleshooting

If Corepack fails with a cache permission error, clear or repair the local Corepack cache, then rerun the command from a normal terminal.

If `supabase db reset` cannot connect to Docker, start Docker Desktop and confirm the Supabase CLI can see the local Docker engine.

If login succeeds but `/app/dashboard` shows no organization access, rerun `supabase/seed.sql` and confirm `organization_memberships` contains an active membership for the Auth user.

If `/admin` redirects to forbidden, confirm `platform_super_admins` contains an active row for the Auth user. Organization owner/admin roles do not grant platform super admin access.

If hosted Auth redirects fail, check the Supabase Auth redirect URL allow-list and `FLEETOS_APP_URL`.
