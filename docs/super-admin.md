# FleetOS Super Admin

FleetOS super admin is a separate internal platform layer. It is not controlled by organization roles.

## Access Model

- Super-admin users are stored in `platform_super_admins`.
- Access is checked server-side only.
- Organization roles such as `owner` or `admin` do not grant `/admin` access.
- Service-role Supabase access is used only on the server.
- Service-role keys must never be exposed to client components or browser code.

## Routes

- `/admin/organizations`
- `/admin/users`
- `/admin/billing`
- `/admin/support`
- `/admin/system-health`

## Auditing

Super-admin views and mutations write to `audit_logs` with `super_admin: true` metadata.

Audited actions include:

- viewing organizations
- suspending and reactivating organizations
- viewing users
- viewing billing placeholders
- updating plan limits
- creating support-access sessions
- viewing system health

## Support Access

Support access creates a short-lived `support_access_sessions` record with target user, organization, reason, status, and expiry. This is an audited support workflow foundation, not an untracked frontend impersonation shortcut.

## V1 Boundaries

V1 keeps billing/payment status as a placeholder and keeps dedicated infrastructure as future-ready metadata. The super-admin layer can see those fields, but it does not implement billing, custom domains, AI, live GPS, or dedicated tenant routing.
