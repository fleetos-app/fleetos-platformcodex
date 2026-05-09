# FleetOS Platform

FleetOS is a modular SaaS foundation for transport operators, refrigerated logistics companies, subcontractor-heavy logistics businesses, and 5-200 truck operators.

## V1 Architecture

- Next.js App Router
- TypeScript
- Supabase Auth and Postgres
- Single shared Supabase project
- Organization-based multi-tenancy
- Strict Row Level Security
- pnpm workspaces
- Modular feature structure

## Workspace

- `apps/web` - FleetOS web app
- `apps/web/modules/fleet` - Fleet/Vehicles foundation
- `apps/web/modules/jobs-runs` - Jobs/Runs operational foundation
- `apps/web/modules/user-management` - Organization user management foundation
- `apps/web/modules/super-admin` - FleetOS internal super-admin foundation
- `packages/auth` - auth, session, membership, and guard helpers
- `packages/rbac` - centralized roles and permissions
- `packages/database` - Supabase client boundary and shared database types
- `packages/ui` - reusable UI primitives
- `supabase/migrations` - database migrations
- `supabase/seed.sql` - local demo seed data
- `DATABASE.md` - schema relationships and fresh database setup
- `docs` - architecture and operating decisions

## Setup

```bash
corepack pnpm install
cp .env.example .env.local
```

Fill in Supabase values in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
FLEETOS_APP_URL=http://localhost:3000
```

Apply migrations and seed locally:

```bash
supabase db reset
```

Docker Desktop must be running for the Supabase local stack.

Run the app:

```bash
corepack pnpm dev
```

Demo user after seeding:

- `admin@fleetos.local`
- local reset password: `Password123!`

The seed uses `admin@fleetos.local` if it already exists, or creates it for a fresh local reset. For SQL Editor setup and hosted Supabase notes, see [SEEDING.md](SEEDING.md). For schema relationships, see [DATABASE.md](DATABASE.md).

## Quality Gates

```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
```

## Milestone 1 Scope

Included:

- real login with email/password and magic link
- staff, driver, subcontractor, and client login entry points
- protected `/app` routes
- organization membership gating
- permission-aware app navigation
- role-based dashboards
- operational control tower
- Fleet/Vehicles foundation
- organization user management
- Jobs/Runs foundation
- audited Jobs/Runs create and update operations
- internal `/admin` super-admin foundation
- seed data and setup docs

Not included:

- billing implementation
- live GPS
- AI automation
- client portal
- driver mobile app
- dedicated tenant infrastructure routing
