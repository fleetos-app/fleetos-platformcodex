# FleetOS Rebuild Roadmap

## Phase 0: Foundation

- Establish the pnpm monorepo.
- Add the Next.js web app shell.
- Add package boundaries for database, auth, RBAC, tenant routing, UI, and config.
- Add Supabase migration and function directories.
- Verify `pnpm install` and `pnpm build`.

## Phase 1: Platform Primitives

- Define tenant data model.
- Define authenticated session flow.
- Define RBAC policy model.
- Add test strategy for shared packages and app routes.

## Phase 2: Product Surfaces

- Add product modules one at a time.
- Keep feature state behind package boundaries.
- Add migrations alongside the feature that requires them.

## Phase 3: Operations

- Add CI checks.
- Add preview deployment workflow.
- Add environment and secret management documentation.

## Guardrails

- Do not import Lovable code.
- Do not build product features inside the foundation phase.
- Keep packages small, typed, and independently buildable.
