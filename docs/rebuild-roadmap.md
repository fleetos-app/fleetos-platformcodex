# FleetOS V1 Roadmap

FleetOS V1 should focus on useful operational workflows for transport and logistics SMEs while keeping the architecture simple and modular.

## Phase 0: Foundation

- Keep the pnpm monorepo clean.
- Keep the Next.js app shell small.
- Use one shared Supabase project.
- Use organization-based tenancy.
- Use strict RLS.
- Use centralized RBAC.
- Use audit logs for sensitive actions.
- Keep `tenant_infrastructure` and `tenant_domains` as future-ready tables only.

## Phase 1: Access And Onboarding

- Complete email-based onboarding.
- Invite users into organizations.
- Assign roles through organization memberships.
- Centralize tenant and organization resolution.
- Centralize permission checks.
- Add tests for core auth, membership, and RBAC logic.

## Phase 2: Modular Operations

Build operational modules one at a time. Do not build logistics modules until the foundation and module pattern are ready.

Each future module should include:

- `components` for UI
- `services` for business logic
- `repositories` or `queries` for database access
- shared `types.ts`
- module permissions
- tests for core logic
- migrations for database changes
- RLS policies for tenant and organization isolation
- audit logging for sensitive actions

## Phase 3: Realtime And Mobile Responsiveness

- Add realtime only where live operations need it.
- Keep realtime subscriptions scoped by tenant and organization.
- Build responsive screens from the start.
- Optimize for operators, drivers, subcontractors, mechanics, clients, and admin users on mobile and desktop.
- Keep UI fast and workflow-focused.

## Phase 4: Integration Readiness

Prepare clean extension points without building integrations too early.

- Accounting integrations should become their own modules.
- AI automation should call service-layer workflows, not UI code.
- Mobile app work should reuse shared types and service/API contracts.
- Custom domains should build on `tenant_domains`.
- Dedicated enterprise infrastructure should build on `tenant_infrastructure`.

## Phase 5: Enterprise Expansion

Only expand infrastructure when V1 customer demand proves the need.

Future paths:

- custom domains
- dedicated Supabase projects for large customers
- enterprise onboarding and provisioning
- advanced audit exports
- deeper admin controls
- mobile app
- AI automation
- accounting integrations

## Decision Rules

- Choose the simplest architecture that protects tenant data.
- Prefer clear modules over clever abstractions.
- Keep business logic out of UI components.
- Keep database access out of UI components.
- Use migrations for every schema change.
- Add tests where logic affects access, tenant scope, money, automation, or operational state.
- Avoid shortcuts that make future refactoring difficult.

## V1 Success Criteria

- Operators can run daily work faster.
- Access control is clear and safe.
- Data isolation is enforced by RLS.
- Audit logs capture important actions.
- UI is fast and mobile responsive.
- Database structure is reliable and maintainable.
- The codebase can absorb new modules without becoming tangled.
