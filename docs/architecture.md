# FleetOS V1 Architecture

FleetOS V1 is built for transport operators, refrigerated logistics companies, logistics and transport SMEs, subcontractor-heavy businesses, outsourced operations teams, and operationally complex companies running roughly 5 to 200 trucks.

The architecture goal is simple: ship a reliable operations platform quickly without creating infrastructure complexity before the product needs it.

## V1 Strategy

- Use one shared Supabase project.
- Use strict Row Level Security for data isolation.
- Use organization-based multi-tenancy.
- Use email-based onboarding.
- Keep `tenant_infrastructure` for future scaling plans, but do not implement dedicated infrastructure routing in V1.
- Prioritize operational modules over enterprise complexity.
- Keep the codebase modular so enterprise expansion remains possible later.

## Architecture Goals

- Fast execution.
- Strong scalability.
- Simplicity.
- Low operational complexity.
- High maintainability.
- Fast, responsive UI.
- Reliable database structure.
- Real-time operational workflows where live state matters.

## Target Market

FleetOS V1 is for:

- Transport operators.
- Refrigerated logistics companies.
- Logistics and transport companies.
- Subcontractor-heavy businesses.
- Businesses that coordinate outsourced work.
- 5 to 200 truck operators.
- Operationally complex SMEs.

## Tenancy

V1 tenancy is organization-based.

- `organizations` are the customer workspace boundary.
- `organization_memberships` connect Supabase Auth users to organizations.
- Every tenant-owned table must include `tenant_id`.
- Operational tables should include `organization_id` when records belong to a customer workspace.
- Tenant and organization lookup logic must stay centralized in auth, tenancy, or database helpers.
- UI components must not manually infer tenant access.
- RLS must enforce tenant and organization boundaries in the database.

`platform_tenants` remains as a higher-level platform boundary. `tenant_infrastructure` remains for future enterprise scaling, but V1 must not route customers to dedicated Supabase projects or custom infrastructure.

## Supabase

V1 uses a single shared Supabase project:

- one Postgres database
- one Supabase Auth instance
- one shared API/control plane
- strict RLS on tenant-owned tables
- migrations for every database change
- audit logs for sensitive and important events
- realtime subscriptions for operational workflows that need live coordination

This keeps V1 operationally simple while leaving room to move large enterprise customers to dedicated infrastructure later.

## Module Boundaries

Every major feature must live in its own module. Do not mix unrelated workflows into shared UI or generic utility folders.

Recommended module shape:

```text
modules/<feature>/
  components/
  services/
  repositories/
  queries/
  types.ts
  permissions.ts
  __tests__/
```

Rules:

- UI components render state and collect input.
- Business logic lives in `services`.
- Database access lives in `repositories` or `queries`.
- Shared types stay strongly typed and are exported deliberately.
- Core logic gets tests.
- Database changes always use Supabase migrations.
- Feature modules may depend on shared auth, RBAC, database, UI, and config packages.
- Shared packages must not depend on feature modules.

## Business Logic

Do not hardcode business rules inside React components.

Use services for:

- workflow decisions
- validation rules
- state transitions
- permission-aware actions
- audit-worthy operations
- orchestration across repositories

Use repositories and query files for:

- Supabase reads
- Supabase writes
- typed query payloads
- persistence-specific mapping

This keeps future refactoring possible when modules grow, mobile apps arrive, or integrations need the same logic.

## RBAC

RBAC is centralized in `packages/rbac` and consumed through auth/server helpers.

Default V1 roles:

- `owner`
- `admin`
- `ops_manager`
- `accounts`
- `driver`
- `subcontractor`
- `client`
- `mechanic`

Rules:

- Server-side checks are authoritative.
- RLS is the database enforcement layer.
- UI checks are only for user experience.
- Permissions should be explicit and named by capability.
- Feature modules can define module permissions, but RBAC evaluation stays centralized.

## Audit Logs

Audit logs are part of the V1 foundation.

Log:

- login and logout
- sensitive route access
- membership and role changes
- important operational state changes
- destructive actions
- integration actions when integrations are added later

Audit records should include tenant, organization, actor, action, entity, metadata, timestamp, and request context when available.

## Naming Conventions

- Tables: plural snake_case, for example `organization_memberships`.
- Columns: snake_case.
- TypeScript files: kebab-case or clear domain names, for example `membership-service.ts`.
- React components: PascalCase.
- Services: `<feature>-service.ts`.
- Repositories: `<feature>-repository.ts`.
- Query files: `<feature>-queries.ts`.
- Tests: colocated in `__tests__` or named `*.test.ts`.
- Permissions: dot notation, for example `dispatch.read` or `membership.update`.
- Audit actions: dot notation, for example `auth.login` or `membership.role_changed`.

## Future Expansion

Leave room for:

- custom domains through `tenant_domains`
- enterprise dedicated infrastructure through `tenant_infrastructure`
- a mobile app that reuses service contracts and API boundaries
- AI automation through service-level workflows and audit logs
- accounting integrations through dedicated integration modules

Do not implement those systems early. Keep the boundaries clean so they can be added when customer demand justifies them.

## Guardrail

Do not overengineer V1. FleetOS should be fast, reliable, modular, and easy to change before it becomes enterprise-complete.
