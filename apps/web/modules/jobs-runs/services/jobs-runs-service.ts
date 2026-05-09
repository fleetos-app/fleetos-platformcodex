import type { FleetOSSupabaseClient } from "@fleetos/database";
import { logAuthAuditEvent } from "@fleetos/auth";
import {
  insertJob,
  insertRun,
  insertStatusHistory,
  queryJobById,
  queryJobs,
  queryRunById,
  queryRuns,
  queryStatusHistory,
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
  StatusHistoryEntry,
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

  return {
    job: mapJobSummary(job),
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
    stops: (run.run_stops ?? []).sort((a: any, b: any) => a.sequence - b.sequence),
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

function mapJobSummary(row: any): JobSummary {
  if (!isJobStatus(row.status)) {
    throw new Error(`Unknown job status: ${row.status}`);
  }

  return {
    id: row.id,
    title: row.title,
    status: row.status,
    customerReference: row.customer_reference,
    internalReference: row.internal_reference,
    requestedPickupAt: row.requested_pickup_at,
    requestedDeliveryAt: row.requested_delivery_at,
    temperatureMinC: row.temperature_min_c,
    temperatureMaxC: row.temperature_max_c,
    podRequired: row.pod_required,
    customer: row.customers
      ? {
          id: row.customers.id,
          name: row.customers.name,
          customerReference: row.customers.customer_reference,
        }
      : undefined,
    pickupLocation: mapLocation(row.pickup_locations),
    deliveryLocation: mapLocation(row.delivery_locations),
    createdAt: row.created_at,
  };
}

function mapRunSummary(row: any): RunSummary {
  if (!isRunStatus(row.status)) {
    throw new Error(`Unknown run status: ${row.status}`);
  }

  return {
    id: row.id,
    runNumber: row.run_number,
    title: row.title,
    status: row.status,
    plannedStartAt: row.planned_start_at,
    plannedEndAt: row.planned_end_at,
    driverUserId: row.driver_user_id,
    subcontractorId: row.subcontractor_id,
    vehicleId: row.vehicle_id,
    stopCount: row.run_stops?.length ?? 0,
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
