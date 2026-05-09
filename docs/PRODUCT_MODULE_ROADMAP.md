# FleetOS Product Module Roadmap

This roadmap translates the old FleetOS/Subbies product surface into the new FleetOS architecture. It prioritizes serious V1 transport operations for 5-200 truck operators, refrigerated logistics teams, and subcontractor-heavy SMEs.

Do not copy old code. Rebuild capabilities into the new modular monorepo with strict RLS, organization tenancy, centralized RBAC, services, repositories, tests, and migrations.

## Product Strategy

V1 should win on daily operational reliability:

- Dispatch can see what is happening.
- Jobs and runs are safe, searchable, auditable, and fast.
- Subcontractor and fleet data is trustworthy.
- PODs, incidents, and compliance risks are captured.
- The UI is mobile-friendly for operational staff.

V1 should not become a giant enterprise platform:

- No live GPS yet.
- No AI automation yet.
- No full client portal until internal workflows are stable.
- No SaaS billing.
- No dedicated infrastructure routing.

## Module Boundaries

| Module | Purpose | Primary roles | Suggested route group | Data ownership |
| --- | --- | --- | --- | --- |
| `operations` | Control tower, alerts, operational dashboard | owner, admin, ops_manager | `/app/control-tower`, `/app/alerts` | Derived views over jobs, runs, PODs, incidents, compliance |
| `jobs-runs` | Jobs, runs, stops, allocations, lifecycle | owner, admin, ops_manager, subcontractor, client | `/app/jobs`, `/app/runs`, `/app/dispatch` | `jobs`, `runs`, `run_stops`, `allocations`, status history |
| `dispatch` | Planner, queue, run canvas, map, capacity validation | owner, admin, ops_manager | `/app/dispatch` | Jobs/runs plus dispatch settings and territories |
| `customers` | Customer accounts, pickup/delivery locations, contacts | owner, admin, ops_manager, accounts | `/app/customers` | `customers`, locations, contacts, rates later |
| `subcontractors` | Partner profiles, onboarding, permissions, documents | owner, admin, ops_manager | `/app/subcontractors` | `subcontractors`, membership links, partner docs |
| `fleet` | Vehicles, registrations, check-ins, service state | owner, admin, ops_manager, mechanic | `/app/fleet` | `vehicles`, compliance/registration records, check-ins |
| `pods` | Proof of delivery capture, review, client visibility | admin, ops_manager, subcontractor, client | `/app/pods` | `pods`, `pod_photos`, comments, job links |
| `incidents` | Incident intake, triage, corrective actions | admin, ops_manager, subcontractor | `/app/incidents` | `incidents`, `corrective_actions` |
| `compliance` | Compliance hub, documents, inspections, temperature, training, fatigue | admin, ops_manager, mechanic, subcontractor | `/app/compliance` | Compliance documents, inspection submissions, temperature, training |
| `finance-ops` | Work logs, subcontractor invoices, payments, advances | owner, admin, accounts, subcontractor | `/app/work-logs`, `/app/invoices`, `/app/accounts` | `work_logs`, invoices, deductions, payment calendar |
| `costs` | Fuel, tolls, maintenance, fixed costs, cost imports | owner, admin, accounts, mechanic | `/app/costs`, `/app/fuel`, `/app/tolls` | Fuel/toll/maintenance transactions and import batches |
| `reports` | Operational and finance reports | owner, admin, ops_manager, accounts, client | `/app/reports` | Read models and views |
| `client-portal` | Customer self-service portal | client | `/client` or `/app/client` | Customer-scoped jobs, PODs, quotes, invoices |
| `subcontractor-portal` | Partner self-service portal | subcontractor | `/portal` or `/app/portal` | Partner-scoped runs, invoices, PODs, docs |
| `mechanic-portal` | Mechanic maintenance workspace | mechanic | `/mechanic` or `/app/mechanic` | Mechanic-scoped maintenance records |
| `integrations` | Webhooks, imports, notification queue | owner, admin, technical ops, system | `/app/settings/integrations` | Webhook subscriptions/events, email queue, import batches |

## Recommended Releases

### V1.1 - Operational Parity Core

Goal: Make the internal operations product feel serious and usable every day.

P0:

- Upgrade Jobs/Runs with old product parity fields, advanced filtering, bulk actions, and allocation UX.
- Build Dispatch Planner with queue, run builder canvas, capacity validation, and run stop editing.
- Build Subcontractor Management with profiles, onboarding, status, membership linkage, and audit.
- Build Fleet/Vehicles depth: registration, ownership, service metadata, availability, and history.
- Build POD module with submit, photo upload, approve/reject, and job/run linkage.
- Upgrade Control Tower with live operational aggregates and blockers.

P1:

- Add manifest import preview.
- Add daily truck log/check-in foundation.
- Add alert generation for operational exceptions.
- Add audit history UI.

### V1.2 - Compliance and Cold Chain

Goal: Serve refrigerated transport and safety-heavy operators.

P1:

- Incidents and corrective actions.
- Compliance hub with open risks and expiry tracking.
- Subcontractor documents and expiry status.
- Temperature records and breach detection.
- Registration expiry review.

P2:

- Inspection templates and submissions.
- Training register.
- Fatigue declarations.
- Public incident and truck check-in forms with signed tokens.

### V1.3 - Work Logs and Payables

Goal: Support subcontractor-heavy businesses without full SaaS billing.

P1:

- Work logs with approvals.
- Weekly subcontractor invoice lifecycle.
- Invoice line items, comments, and audit history.
- Payment calendar and mark-paid workflow.

P2:

- Driver advances and back pay.
- Export formats for CSV, Xero, ABA.
- Accounts role dashboard.

### V2 - Portals and Deeper Finance

Goal: Expose mature workflows to external parties after internal data quality is reliable.

P1:

- Subcontractor portal: runs, work history, invoices, PODs, documents, compliance.
- Client access management with customer-scoped users.
- Client portal basics: dashboard, bookings, orders, PODs, deliveries.

P2:

- Quotes and rate calculator.
- Client reports and documents.
- Fuel cards/import/statements.
- Tolls import and allocation.
- Maintenance module and mechanic portal.
- Truck profitability and revenue forecast.

### Later - Platform and Automation

Goal: Add ecosystem complexity only after operational workflows are sticky.

P3:

- Webhooks and API subscriptions.
- Notification queue and templated email campaigns.
- Live GPS and driver mobile app.
- AI automation for dispatch, imports, and anomaly detection.
- Advanced route optimization with geocoding provider.
- Inventory and deeper cold-chain client portal features.

## Permission Roadmap

Add permissions in domain groups instead of one-off UI checks:

- `dispatch.read`, `dispatch.write`, `dispatch.optimize`
- `subcontractors.read`, `subcontractors.write`, `subcontractors.permissions.write`
- `pods.read`, `pods.create`, `pods.approve`
- `incidents.read`, `incidents.write`, `incidents.close`
- `compliance.read`, `compliance.write`
- `temperature.read`, `temperature.write`
- `work_logs.read`, `work_logs.write`, `work_logs.approve`
- `invoices.read`, `invoices.write`, `invoices.approve`, `invoices.pay`, `invoices.export`
- `payments.read`, `payments.write`, `payments.export`
- `fuel.read`, `fuel.write`, `fuel.import`
- `tolls.read`, `tolls.write`, `tolls.import`
- `maintenance.read`, `maintenance.write`
- `reports.read`, `reports.finance`
- `client_portal.access`, `client_portal.manage`
- `integrations.read`, `integrations.write`
- `notifications.read`, `notifications.write`

## Module Implementation Standard

Every module should use this shape:

```text
apps/web/modules/<module>/
  actions.ts
  components/
  repositories/
  services/
  types.ts
  __tests__/
```

Rules:

- Repositories own Supabase queries only.
- Services own validation, workflow rules, status transitions, and audit calls.
- Pages compose services and components.
- Components receive data and callbacks; they do not own business policy.
- Tests cover core service rules and permission-sensitive logic.
- Migrations define tables, indexes, RLS, triggers, and seed/reference data.

## Product Decisions From The Old Repo

- Keep the old role surfaces as product concepts, but converge the internal app under one professional shell.
- Treat portals as separate route groups only when they have enough capability to justify a different layout.
- Convert old `subcontractors` email/user linkage into explicit organization memberships and profile records.
- Convert old truck registration concepts into the new `vehicles` model plus compliance extension tables.
- Keep old financial features as operational payables, not SaaS billing.
- Rebuild imports as reviewable, idempotent batch workflows.
- Rebuild public forms with signed organization-scoped tokens, not open anonymous writes.
