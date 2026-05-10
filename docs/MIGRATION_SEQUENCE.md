# FleetOS Migration Sequence

This document defines the safest order to rebuild valuable FleetOS/Subbies features into the new FleetOS platform. It is a product and architecture migration plan, not a direct code migration plan.

Do not copy old generated code. Use the old repo for workflow discovery, field discovery, and edge-case discovery only.

## Ground Rules

- Add migrations before UI work.
- Keep all tenant-owned tables scoped by `tenant_id` and `organization_id`.
- Add RLS for every new tenant-owned table.
- Add indexes for tenant, organization, user, status, and foreign-key access paths.
- Keep database access in repositories.
- Keep business rules in services.
- Keep RBAC centralized in `packages/rbac`.
- Add audit logs for create, update, approve, reject, pay, import, public intake, and sensitive reads.
- Add tests for service rules before broad UI build-out.
- Prefer extending current foundation tables when appropriate; avoid recreating old schema table-for-table.

## Phase 0 - Baseline Stabilization

Status: largely complete in the new platform.

Required baseline:

- Auth and organization membership works.
- Platform super admin is separate from organization roles.
- Jobs, runs, allocations, customers, vehicles, drivers, subcontractors exist.
- Strict RLS and tenant-safe queries are in place.
- Seed data supports local demo setup.
- `pnpm build`, `pnpm lint`, `pnpm typecheck`, and tests pass.

Exit criteria:

- Login loads `/app/dashboard`.
- Organization membership resolution is reliable.
- Jobs and runs list/detail pages work with seeded data.
- No ambiguous PostgREST embeds.

## Phase 1 - Jobs/Runs/Dispatch Core

Old references:

- `src/pages/admin/Jobs.tsx`
- `src/pages/admin/RunBuilder.tsx`
- `src/pages/admin/DispatchPlanner.tsx`
- `src/components/dispatch/*`
- `src/hooks/useJobs.ts`
- `src/hooks/useRuns.ts`
- `src/hooks/useDispatchJobs.ts`
- `src/lib/dispatchCalculations.ts`
- `src/lib/routeOptimizer.ts`

Migration slices:

1. Add missing operational fields to existing `jobs`, `runs`, `run_stops`, and `allocations`.
2. Add `dispatch_settings` and `dispatch_territories` only if needed for V1 dispatch planner.
3. Add repository/service methods for queue, allocation, run stop ordering, and capacity validation.
4. Build dispatch planner UI as a real workspace: job queue, run builder, stop list, validation panel.
5. Add manifest import preview after manual job workflows are solid.

Exit criteria:

- Ops manager can create jobs, build a run, assign vehicle/driver/subcontractor, reorder stops, and see audit/status history.
- Dashboard/control tower can show real job/run counts and blockers.
- All write operations are audited.

## Phase 2 - Subcontractors and Fleet Depth

Old references:

- `src/pages/admin/Subcontractors.tsx`
- `src/pages/admin/FleetManagement.tsx`
- `src/pages/admin/fleet/Trucks.tsx`
- `src/pages/admin/RegoReview.tsx`
- `src/pages/admin/DailyTruckLog.tsx`
- `src/hooks/useSubcontractorAdmin.ts`
- `src/hooks/useTruckRegistrations.ts`
- `src/hooks/useFleetManagement.ts`
- `src/hooks/useDailyTruckAssignments.ts`

Schema mapping:

| Old concept | New direction |
| --- | --- |
| `subcontractors` | Extend current `subcontractors` with profile/commercial fields through migrations |
| `truck_registrations` | Normalize into `vehicles` plus `vehicle_registrations` or compliance records |
| `daily_truck_assignments` | Prefer allocations/runs as the planning source; add daily assignment table only for true daily planning gaps |
| `subcontractor_permissions` | Prefer RBAC plus optional feature overrides |

Migration slices:

1. Add subcontractor profile fields and invitation linkage to organization memberships.
2. Add vehicle registration/compliance extension table.
3. Add fleet service/availability fields if not covered by current `vehicles`.
4. Add daily truck log only after dispatch/runs model proves it needs a separate daily planning record.

Exit criteria:

- Admin can manage subcontractor profile and status.
- Admin can manage vehicle registration and fleet availability.
- Ops can allocate work against trustworthy subcontractor/vehicle data.

## Phase 3 - PODs and Operational Evidence

Old references:

- `src/pages/admin/PODManagement.tsx`
- `src/pages/portal/POD.tsx`
- `src/pages/client/PODs.tsx`
- `src/components/portal/SubmitPOD.tsx`
- `src/hooks/usePods.ts`
- `src/hooks/useClientPods.ts`

Migration slices:

1. Add `pods`, `pod_photos`, and `pod_comments`.
2. Link PODs to organization, job, run, stop, customer, and submitting user/subcontractor.
3. Add Supabase storage policies for POD photos.
4. Add approval/rejection workflow with reason and audit.
5. Add status update hooks to mark job/run delivery states when POD is accepted.

Exit criteria:

- Subcontractor or staff can submit POD with photos/signature metadata.
- Admin can approve/reject.
- Job detail and client-ready read model can show POD state.

## Phase 4 - Incidents, Compliance, Temperature

Old references:

- `src/pages/admin/Incidents.tsx`
- `src/pages/admin/ComplianceHub.tsx`
- `src/pages/admin/Temperature.tsx`
- `src/pages/admin/Inspections.tsx`
- `src/pages/admin/TrainingRegister.tsx`
- `src/pages/admin/FatigueManagement.tsx`
- `src/pages/ReportIncident.tsx`
- `src/hooks/useComplianceEngine.ts`
- `src/hooks/useIncidents.ts`
- `src/hooks/useCorrectiveActions.ts`
- `src/hooks/useTemperature.ts`
- `src/hooks/useInspections.ts`
- `src/hooks/useTraining.ts`
- `src/hooks/useFatigue.ts`

Migration slices:

1. Add incidents and corrective actions.
2. Add temperature records linked to jobs/runs/vehicles.
3. Add subcontractor/vehicle document expiry records.
4. Add compliance hub read model.
5. Add inspections, training, and fatigue only after the core hub is useful.
6. Add public incident intake with signed organization token.

Exit criteria:

- Ops can record incidents and corrective actions.
- Cold-chain jobs can record temperature and breach state.
- Compliance hub shows open/expired/risky items.

## Phase 5 - Work Logs and Operational Payables

Old references:

- `src/pages/admin/WorkLogs.tsx`
- `src/pages/admin/Invoices.tsx`
- `src/pages/accounts/*`
- `src/pages/portal/Invoices.tsx`
- `src/hooks/useWorkLogs.ts`
- `src/hooks/useInvoices.ts`
- `src/hooks/useInvoiceLineItems.ts`
- `src/hooks/useInvoiceComments.ts`
- `src/hooks/useDriverAdvances.ts`
- `src/hooks/useDriverBackPay.ts`
- `src/lib/exportUtils.ts`

Important distinction:

- This is subcontractor operational payables.
- This is not FleetOS SaaS billing.

Migration slices:

1. Add `work_logs` with approval fields and job/run/vehicle/subcontractor links.
2. Add `weekly_invoices` and `invoice_line_items`.
3. Add invoice comments and deductions.
4. Add payment calendar and mark-paid workflow.
5. Add driver advances/back-pay after invoice lifecycle is reliable.
6. Add exports as server-side generated files.

Exit criteria:

- Admin/accounts can approve work logs.
- Admin/accounts can create/review/approve/pay subcontractor invoices.
- Subcontractor-visible invoice state is ready for a portal.

## Phase 6 - Portals

Old references:

- `src/components/layout/PortalLayout.tsx`
- `src/components/layout/ClientLayout.tsx`
- `src/pages/portal/*`
- `src/pages/client/*`
- `src/hooks/useSubcontractorPermissions.ts`
- `src/hooks/useClientPortalFeatures.ts`
- `src/hooks/useClientJobs.ts`
- `src/hooks/useClientPods.ts`

Migration slices:

1. Build subcontractor portal first because it directly supports operations.
2. Expose my runs, work history, PODs, invoices, documents, incidents, and compliance using membership-scoped queries.
3. Add client access management with customer-to-membership links.
4. Add client portal dashboard, bookings, orders, deliveries, PODs.
5. Add client quotes, invoices, reports, documents, support after internal modules are mature.

Exit criteria:

- Portal users cannot access other organizations or other customers/subcontractors.
- Portal navigation is permission/feature-aware.
- All portal writes are audited.

## Phase 7 - Costs, Maintenance, and Profitability

Old references:

- `src/pages/admin/FuelImport.tsx`
- `src/pages/admin/TollExpenses.tsx`
- `src/pages/admin/fleet/Maintenance.tsx`
- `src/pages/mechanic/*`
- `src/pages/PublicMechanicService.tsx`
- `src/pages/admin/fleet/TruckProfitability.tsx`
- `src/hooks/useFuelImport.ts`
- `src/hooks/useTolls.ts`
- `src/hooks/useTruckProfitability.ts`
- `supabase/functions/parse-fuel-bill`
- `supabase/functions/parse-toll-pdf`
- `supabase/functions/parse-maintenance-invoice`

Migration slices:

1. Add maintenance records linked to vehicles.
2. Add mechanic role workflows for internal maintenance entry.
3. Add fuel cards and fuel transactions.
4. Add toll transactions.
5. Add import batch models for fuel/tolls/maintenance parser outputs.
6. Add truck profitability read model after finance and costs are reliable.

Exit criteria:

- Vehicle cost sources are consistent enough for P&L.
- Imports are reviewable and idempotent.

## Phase 8 - Integrations and Notifications

Old references:

- `src/pages/admin/WebhooksPage.tsx`
- `src/hooks/useWebhooks.ts`
- `src/lib/emailNotifications.ts`
- `supabase/functions/process-email-queue`
- `supabase/functions/auth-email-hook`
- `supabase/functions/send-*`
- `supabase/functions/_shared/email-templates/*`

Migration slices:

1. Define event model for domain actions.
2. Add webhook subscriptions/events with signing secrets.
3. Add notification preferences and templates.
4. Add email queue only when product workflows have enough volume.
5. Add summary emails and compliance alerts after alert rules are stable.

Exit criteria:

- Webhooks are signed, retryable, and observable.
- Email sends are logged, idempotent, and suppressible.

## Old-To-New Data Mapping Notes

| Old table/view | New architecture note |
| --- | --- |
| `jobs` | Already exists; add fields carefully through migrations and keep tenant/org FKs |
| `runs`, `run_stops` | Already exists; expand run stop details and dispatch metadata |
| `subcontractors` | Exists; add commercial/profile fields and membership linkage |
| `truck_registrations` | Map into `vehicles` plus registration/compliance extension |
| `clients` | Map into current `customers`; add customer portal/account extension later |
| `client_users` | Map into `organization_memberships` with `client` role plus customer access table |
| `weekly_invoices` | New operational payables module, separate from SaaS billing |
| `pods`, `pod_photos`, `pod_comments` | New POD module tied to jobs/runs/customers |
| `maintenance_records` | New maintenance module tied to vehicles and mechanic role |
| `fuel_*`, `toll_*` | New cost/import modules after finance foundation |
| `business_documents`, `subcontractor_documents`, `compliance_documents` | Shared document/compliance module with entity links |
| `v_*` views | Rebuild as read models only after write modules stabilize |
| `user_roles` | Replace with central memberships/RBAC |
| `company_settings` | Tenant/organization settings extension |

## Data Migration Approach For Future Imports

When old production data needs to move:

1. Freeze target schema for the module.
2. Create an import staging table per source area.
3. Load old data into staging without trusting it.
4. Validate tenant, organization, user, customer, subcontractor, vehicle, job, and invoice references.
5. Transform into normalized target tables.
6. Record import batches and row-level errors.
7. Run reconciliation reports before enabling the module.

No direct old-table-to-new-table copy should happen inside application code.

## Build Gate For Every Phase

Before closing any phase:

```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
```

Also run Supabase migration reset when Docker/Supabase local stack is available:

```bash
supabase db reset
```
