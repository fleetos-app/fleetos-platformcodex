import type { FleetOSSupabaseClient } from "@fleetos/database";
import { logAuthAuditEvent } from "@fleetos/auth";
import {
  insertJob,
  insertRun,
  insertStatusHistory,
  queryCustomers,
  queryDeliveryLocations,
  queryDriverOptions,
  queryJobById,
  queryJobs,
  queryLatestJobAllocation,
  queryPickupLocations,
  queryRunById,
  queryRunOptions,
  queryRuns,
  queryStatusHistory,
  querySubcontractorUserOptions,
  queryVehicleOptions,
  updateJob as updateJobRecord,
  updateRun as updateRunRecord,
  upsertAllocation,
} from "../repositories/jobs-runs-repository";
import { isJobStatus, isRunStatus } from "../status";
import type {
  CreateJobInput,
  CreateRunInput,
  JobListFilters,
  JobStatus,
  JobSummary,
  OperationalScope,
  PaginatedResult,
  RunListFilters,
  RunStatus,
  RunSummary,
  SelectOption,
  StatusHistoryEntry,
  UpdateJobInput,
  UpdateRunInput,
} from "../types";

export function createOperationalScope(input: {
  tenantId?: string;
  organizationId?: string;
  actorUserId: string;
}): OperationalScope {
  if (!input.tenantId || !input.organizationId) {
    throw new Error("Active organization membership is required.");
  }

  return {
    tenantId: input.tenantId,
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
  };
}

export function normalizePageInput(input: { page?: number; pageSize?: number }) {
  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(Math.max(1, input.pageSize ?? 25), 100);
  return { page, pageSize };
}

export function validateTemperatureRange(min?: number | null, max?: number | null) {
  if (min == null || max == null) {
    return;
  }

  if (min > max) {
    throw new Error("Minimum temperature cannot be greater than maximum temperature.");
  }
}

export async function listJobs(
  supabase: FleetOSSupabaseClient,
  scope: OperationalScope,
  filters: JobListFilters = {},
): Promise<PaginatedResult<JobSummary>> {
  const result = await queryJobs(supabase, scope, filters);

  return {
    ...result,
    data: result.data.map(mapJobSummary),
  };
}

export async function listRuns(
  supabase: FleetOSSupabaseClient,
  scope: OperationalScope,
  filters: RunListFilters = {},
): Promise<PaginatedResult<RunSummary>> {
  const result = await queryRuns(supabase, scope, filters);

  return {
    ...result,
    data: result.data.map(mapRunSummary),
  };
}

export async function getJobDetails(
  supabase: FleetOSSupabaseClient,
  scope: OperationalScope,
  jobId: string,
) {
  const [job, history] = await Promise.all([
    queryJobById(supabase, scope, jobId),
    queryStatusHistory(supabase, scope, "job", jobId),
  ]);
  const allocation = await queryLatestJobAllocation(supabase, scope, jobId);

  return {
    job: mapJobSummary({
      ...job,
      driver_user_id: allocation?.driver_user_id ?? null,
      subcontractor_id: allocation?.subcontractor_id ?? null,
      vehicle_id: allocation?.vehicle_id ?? null,
    }),
    history: history.map(mapStatusHistory),
  };
}

export async function getRunDetails(
  supabase: FleetOSSupabaseClient,
  scope: OperationalScope,
  runId: string,
) {
  const [run, history] = await Promise.all([
    queryRunById(supabase, scope, runId),
    queryStatusHistory(supabase, scope, "run", runId),
  ]);

  return {
    run: mapRunSummary(run),
    stops: (run.stops ?? []).sort((a: any, b: any) => a.sequence - b.sequence),
    history: history.map(mapStatusHistory),
  };
}

export async function createJob(
  supabase: FleetOSSupabaseClient,
  scope: OperationalScope,
  input: CreateJobInput,
) {
  validateTemperatureRange(input.temperatureMinC, input.temperatureMaxC);
  const job = await insertJob(supabase, scope, input);
  await upsertAllocation(supabase, scope, {
    jobId: job.id,
    runId: input.runId,
    driverUserId: input.driverUserId,
    subcontractorId: input.subcontractorId,
    vehicleId: input.vehicleId,
  });

  await Promise.all([
    insertStatusHistory(supabase, scope, {
      entityType: "job",
      entityId: job.id,
      toStatus: "pending",
      reason: "Job created",
    }),
    logAuthAuditEvent(supabase, {
      tenantId: scope.tenantId,
      organizationId: scope.organizationId,
      actorUserId: scope.actorUserId,
      action: "auth.sensitive_access",
      entityTable: "jobs",
      entityId: job.id,
      metadata: { operation: "job.create" },
    }),
  ]);

  return job;
}

export async function updateJob(
  supabase: FleetOSSupabaseClient,
  scope: OperationalScope,
  input: UpdateJobInput,
) {
  validateTemperatureRange(input.temperatureMinC, input.temperatureMaxC);
  const existing = await queryJobById(supabase, scope, input.id);
  const job = await updateJobRecord(supabase, scope, input);

  await upsertAllocation(supabase, scope, {
    jobId: input.id,
    runId: input.runId,
    driverUserId: input.driverUserId,
    subcontractorId: input.subcontractorId,
    vehicleId: input.vehicleId,
  });

  if (input.status && existing.status !== input.status) {
    await insertStatusHistory(supabase, scope, {
      entityType: "job",
      entityId: input.id,
      fromStatus: existing.status,
      toStatus: input.status,
      reason: "Job updated",
    });
  }

  await logAuthAuditEvent(supabase, {
    tenantId: scope.tenantId,
    organizationId: scope.organizationId,
    actorUserId: scope.actorUserId,
    action: "auth.sensitive_access",
    entityTable: "jobs",
    entityId: input.id,
    metadata: { operation: "job.update" },
  });

  return job;
}

export async function createRun(
  supabase: FleetOSSupabaseClient,
  scope: OperationalScope,
  input: CreateRunInput,
) {
  const run = await insertRun(supabase, scope, input);

  await Promise.all([
    insertStatusHistory(supabase, scope, {
      entityType: "run",
      entityId: run.id,
      toStatus: "planned",
      reason: "Run created",
    }),
    logAuthAuditEvent(supabase, {
      tenantId: scope.tenantId,
      organizationId: scope.organizationId,
      actorUserId: scope.actorUserId,
      action: "auth.sensitive_access",
      entityTable: "runs",
      entityId: run.id,
      metadata: { operation: "run.create" },
    }),
  ]);

  return run;
}

export async function updateRun(
  supabase: FleetOSSupabaseClient,
  scope: OperationalScope,
  input: UpdateRunInput,
) {
  const existing = await queryRunById(supabase, scope, input.id);
  const run = await updateRunRecord(supabase, scope, input);

  if (input.status && existing.status !== input.status) {
    await insertStatusHistory(supabase, scope, {
      entityType: "run",
      entityId: input.id,
      fromStatus: existing.status,
      toStatus: input.status,
      reason: "Run updated",
    });
  }

  await logAuthAuditEvent(supabase, {
    tenantId: scope.tenantId,
    organizationId: scope.organizationId,
    actorUserId: scope.actorUserId,
    action: "auth.sensitive_access",
    entityTable: "runs",
    entityId: input.id,
    metadata: { operation: "run.update" },
  });

  return run;
}

export async function getJobFormOptions(
  supabase: FleetOSSupabaseClient,
  scope: OperationalScope,
) {
  const [customers, pickupLocations, deliveryLocations, runs, assignments] = await Promise.all([
    queryCustomers(supabase, scope),
    queryPickupLocations(supabase, scope),
    queryDeliveryLocations(supabase, scope),
    queryRunOptions(supabase, scope),
    getAssignmentOptions(supabase, scope),
  ]);

  return {
    customers: customers.map((row: any): SelectOption => ({
      id: row.id,
      label: row.customer_reference ? `${row.name} (${row.customer_reference})` : row.name,
    })),
    pickupLocations: pickupLocations.map((row: any): SelectOption => ({
      id: row.id,
      label: [row.name, row.suburb, row.state].filter(Boolean).join(", "),
    })),
    deliveryLocations: deliveryLocations.map((row: any): SelectOption => ({
      id: row.id,
      label: [row.name, row.suburb, row.state].filter(Boolean).join(", "),
    })),
    runs: runs.map((row: any): SelectOption => ({
      id: row.id,
      label: `${row.run_number} - ${row.title}`,
    })),
    ...assignments,
  };
}

export async function getRunFormOptions(
  supabase: FleetOSSupabaseClient,
  scope: OperationalScope,
) {
  return getAssignmentOptions(supabase, scope);
}

async function getAssignmentOptions(
  supabase: FleetOSSupabaseClient,
  scope: OperationalScope,
) {
  const [drivers, subcontractors, vehicles] = await Promise.all([
    queryDriverOptions(supabase, scope),
    querySubcontractorUserOptions(supabase, scope),
    queryVehicleOptions(supabase, scope),
  ]);

  return {
    drivers: drivers.map((row: any): SelectOption => ({
      id: row.user_id,
      label: row.email ? `${row.display_name} (${row.email})` : row.display_name,
    })),
    subcontractors: subcontractors.map((row: any): SelectOption => ({
      id: row.id,
      label: `Subcontractor user ${String(row.user_id).slice(0, 8)}`,
    })),
    vehicles: vehicles.map((row: any): SelectOption => ({
      id: row.id,
      label: `${row.registration_number} - ${row.name}`,
    })),
  };
}

function mapJobSummary(row: any): JobSummary {
  const status = isJobStatus(row.status) ? row.status : "issue_reported";

  return {
    id: row.id,
    title: row.title,
    status,
    customerReference: row.customer_reference,
    internalReference: row.internal_reference,
    requestedPickupAt: row.requested_pickup_at,
    requestedDeliveryAt: row.requested_delivery_at,
    notes: row.notes,
    temperatureMinC: row.temperature_min_c,
    temperatureMaxC: row.temperature_max_c,
    podRequired: row.pod_required,
    driverUserId: row.driver_user_id ?? null,
    subcontractorId: row.subcontractor_id ?? null,
    vehicleId: row.vehicle_id ?? null,
    customer: row.customer
      ? {
          id: row.customer.id,
          name: row.customer.name,
          customerReference: row.customer.customer_reference,
        }
      : undefined,
    pickupLocation: mapLocation(row.pickup_location),
    deliveryLocation: mapLocation(row.delivery_location),
    createdAt: row.created_at,
  };
}

function mapRunSummary(row: any): RunSummary {
  const status = isRunStatus(row.status) ? row.status : "planned";

  return {
    id: row.id,
    runNumber: row.run_number,
    title: row.title,
    status,
    plannedStartAt: row.planned_start_at,
    plannedEndAt: row.planned_end_at,
    notes: row.notes,
    driverUserId: row.driver_user_id,
    subcontractorId: row.subcontractor_id,
    vehicleId: row.vehicle_id,
    stopCount: row.stops?.length ?? 0,
    createdAt: row.created_at,
  };
}

function mapLocation(row: any) {
  if (!row) {
    return undefined;
  }

  return {
    id: row.id,
    name: row.name,
    suburb: row.suburb,
    state: row.state,
  };
}

function mapStatusHistory(row: any): StatusHistoryEntry {
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    fromStatus: row.from_status,
    toStatus: row.to_status,
    changedBy: row.changed_by,
    changedAt: row.changed_at,
    reason: row.reason,
  };
}
