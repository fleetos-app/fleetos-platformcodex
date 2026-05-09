import type { FleetOSSupabaseClient } from "@fleetos/database";
import type {
  CreateJobInput,
  CreateRunInput,
  JobListFilters,
  JobStatus,
  OperationalScope,
  PaginatedResult,
  RunListFilters,
  RunStatus,
  UpdateJobInput,
  UpdateRunInput,
} from "../types";

function paginationRange(page = 1, pageSize = 25) {
  const safePage = Math.max(1, page);
  const safePageSize = Math.min(Math.max(1, pageSize), 100);
  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;
  return { page: safePage, pageSize: safePageSize, from, to };
}

function pageCount(total: number, pageSize: number) {
  return Math.max(1, Math.ceil(total / pageSize));
}

export async function queryJobs(
  supabase: FleetOSSupabaseClient,
  scope: OperationalScope,
  filters: JobListFilters = {},
): Promise<PaginatedResult<any>> {
  const { page, pageSize, from, to } = paginationRange(filters.page, filters.pageSize);
  const sortBy = filters.sortBy ?? "created_at";
  const sortDirection = filters.sortDirection ?? "desc";

  let query = supabase
    .from("jobs")
    .select(
      "id,title,status,customer_reference,internal_reference,requested_pickup_at,requested_delivery_at,temperature_min_c,temperature_max_c,pod_required,notes,created_at,customer:customers!jobs_customer_tenant_organization_fkey(id,name,customer_reference),pickup_location:pickup_locations!jobs_pickup_location_tenant_organization_fkey(id,name,suburb,state),delivery_location:delivery_locations!jobs_delivery_location_tenant_organization_fkey(id,name,suburb,state)",
      { count: "exact" },
    )
    .eq("tenant_id", scope.tenantId)
    .eq("organization_id", scope.organizationId);

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,customer_reference.ilike.%${filters.search}%,internal_reference.ilike.%${filters.search}%`,
    );
  }

  const { data, error, count } = await query
    .order(sortBy, { ascending: sortDirection === "asc" })
    .range(from, to);

  if (error) {
    throw error;
  }

  return {
    data: data ?? [],
    page,
    pageSize,
    total: count ?? 0,
    pageCount: pageCount(count ?? 0, pageSize),
  };
}

export async function queryRuns(
  supabase: FleetOSSupabaseClient,
  scope: OperationalScope,
  filters: RunListFilters = {},
): Promise<PaginatedResult<any>> {
  const { page, pageSize, from, to } = paginationRange(filters.page, filters.pageSize);
  const sortBy = filters.sortBy ?? "created_at";
  const sortDirection = filters.sortDirection ?? "desc";

  let query = supabase
    .from("runs")
    .select(
      "id,run_number,title,status,planned_start_at,planned_end_at,driver_user_id,subcontractor_id,vehicle_id,notes,created_at,stops:run_stops!run_stops_run_tenant_organization_fkey(id)",
      { count: "exact" },
    )
    .eq("tenant_id", scope.tenantId)
    .eq("organization_id", scope.organizationId);

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.search) {
    query = query.or(`run_number.ilike.%${filters.search}%,title.ilike.%${filters.search}%`);
  }

  const { data, error, count } = await query
    .order(sortBy, { ascending: sortDirection === "asc" })
    .range(from, to);

  if (error) {
    throw error;
  }

  return {
    data: data ?? [],
    page,
    pageSize,
    total: count ?? 0,
    pageCount: pageCount(count ?? 0, pageSize),
  };
}

export async function queryJobById(
  supabase: FleetOSSupabaseClient,
  scope: OperationalScope,
  jobId: string,
) {
  const { data, error } = await supabase
    .from("jobs")
    .select(
      "*,customer:customers!jobs_customer_tenant_organization_fkey(id,name,customer_reference),pickup_location:pickup_locations!jobs_pickup_location_tenant_organization_fkey(id,name,suburb,state),delivery_location:delivery_locations!jobs_delivery_location_tenant_organization_fkey(id,name,suburb,state)",
    )
    .eq("tenant_id", scope.tenantId)
    .eq("organization_id", scope.organizationId)
    .eq("id", jobId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function queryRunById(
  supabase: FleetOSSupabaseClient,
  scope: OperationalScope,
  runId: string,
) {
  const { data, error } = await supabase
    .from("runs")
    .select("*,stops:run_stops!run_stops_run_tenant_organization_fkey(*)")
    .eq("tenant_id", scope.tenantId)
    .eq("organization_id", scope.organizationId)
    .eq("id", runId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function insertJob(
  supabase: FleetOSSupabaseClient,
  scope: OperationalScope,
  input: CreateJobInput,
) {
  const { data, error } = await supabase
    .from("jobs")
    .insert({
      tenant_id: scope.tenantId,
      organization_id: scope.organizationId,
      customer_id: input.customerId,
      pickup_location_id: input.pickupLocationId ?? null,
      delivery_location_id: input.deliveryLocationId ?? null,
      title: input.title,
      customer_reference: input.customerReference ?? null,
      internal_reference: input.internalReference ?? null,
      notes: input.notes ?? null,
      requested_pickup_at: input.requestedPickupAt ?? null,
      requested_delivery_at: input.requestedDeliveryAt ?? null,
      temperature_min_c: input.temperatureMinC ?? null,
      temperature_max_c: input.temperatureMaxC ?? null,
      pod_required: input.podRequired ?? false,
      created_by: scope.actorUserId,
      updated_by: scope.actorUserId,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateJob(
  supabase: FleetOSSupabaseClient,
  scope: OperationalScope,
  input: UpdateJobInput,
) {
  const patch: Record<string, unknown> = {
    updated_by: scope.actorUserId,
  };

  if (input.customerId !== undefined) patch.customer_id = input.customerId;
  if (input.pickupLocationId !== undefined) patch.pickup_location_id = input.pickupLocationId;
  if (input.deliveryLocationId !== undefined) patch.delivery_location_id = input.deliveryLocationId;
  if (input.title !== undefined) patch.title = input.title;
  if (input.status !== undefined) patch.status = input.status;
  if (input.customerReference !== undefined) patch.customer_reference = input.customerReference;
  if (input.internalReference !== undefined) patch.internal_reference = input.internalReference;
  if (input.notes !== undefined) patch.notes = input.notes;
  if (input.requestedPickupAt !== undefined) patch.requested_pickup_at = input.requestedPickupAt;
  if (input.requestedDeliveryAt !== undefined) patch.requested_delivery_at = input.requestedDeliveryAt;
  if (input.temperatureMinC !== undefined) patch.temperature_min_c = input.temperatureMinC;
  if (input.temperatureMaxC !== undefined) patch.temperature_max_c = input.temperatureMaxC;
  if (input.podRequired !== undefined) patch.pod_required = input.podRequired;

  const { data, error } = await supabase
    .from("jobs")
    .update(patch)
    .eq("tenant_id", scope.tenantId)
    .eq("organization_id", scope.organizationId)
    .eq("id", input.id)
    .select("id,status")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function insertRun(
  supabase: FleetOSSupabaseClient,
  scope: OperationalScope,
  input: CreateRunInput,
) {
  const { data, error } = await supabase
    .from("runs")
    .insert({
      tenant_id: scope.tenantId,
      organization_id: scope.organizationId,
      run_number: input.runNumber,
      title: input.title,
      planned_start_at: input.plannedStartAt ?? null,
      planned_end_at: input.plannedEndAt ?? null,
      driver_user_id: input.driverUserId ?? null,
      subcontractor_id: input.subcontractorId ?? null,
      vehicle_id: input.vehicleId ?? null,
      notes: input.notes ?? null,
      created_by: scope.actorUserId,
      updated_by: scope.actorUserId,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateRun(
  supabase: FleetOSSupabaseClient,
  scope: OperationalScope,
  input: UpdateRunInput,
) {
  const patch: Record<string, unknown> = {
    updated_by: scope.actorUserId,
  };

  if (input.runNumber !== undefined) patch.run_number = input.runNumber;
  if (input.title !== undefined) patch.title = input.title;
  if (input.status !== undefined) patch.status = input.status;
  if (input.plannedStartAt !== undefined) patch.planned_start_at = input.plannedStartAt;
  if (input.plannedEndAt !== undefined) patch.planned_end_at = input.plannedEndAt;
  if (input.driverUserId !== undefined) patch.driver_user_id = input.driverUserId;
  if (input.subcontractorId !== undefined) patch.subcontractor_id = input.subcontractorId;
  if (input.vehicleId !== undefined) patch.vehicle_id = input.vehicleId;
  if (input.notes !== undefined) patch.notes = input.notes;

  const { data, error } = await supabase
    .from("runs")
    .update(patch)
    .eq("tenant_id", scope.tenantId)
    .eq("organization_id", scope.organizationId)
    .eq("id", input.id)
    .select("id,status")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function upsertAllocation(
  supabase: FleetOSSupabaseClient,
  scope: OperationalScope,
  input: {
    jobId: string;
    runId?: string | null;
    driverUserId?: string | null;
    subcontractorId?: string | null;
    vehicleId?: string | null;
  },
) {
  if (!input.runId && !input.driverUserId && !input.subcontractorId && !input.vehicleId) {
    return;
  }

  const { error } = await supabase.from("allocations").insert({
    tenant_id: scope.tenantId,
    organization_id: scope.organizationId,
    job_id: input.jobId,
    run_id: input.runId ?? null,
    driver_user_id: input.driverUserId ?? null,
    subcontractor_id: input.subcontractorId ?? null,
    vehicle_id: input.vehicleId ?? null,
    created_by: scope.actorUserId,
    updated_by: scope.actorUserId,
  });

  if (error) {
    throw error;
  }
}

export async function insertStatusHistory(
  supabase: FleetOSSupabaseClient,
  scope: OperationalScope,
  input: {
    entityType: "job" | "run";
    entityId: string;
    fromStatus?: JobStatus | RunStatus | null;
    toStatus: JobStatus | RunStatus;
    reason?: string | null;
  },
) {
  const { error } = await supabase.from("status_history").insert({
    tenant_id: scope.tenantId,
    organization_id: scope.organizationId,
    entity_type: input.entityType,
    entity_id: input.entityId,
    from_status: input.fromStatus ?? null,
    to_status: input.toStatus,
    changed_by: scope.actorUserId,
    reason: input.reason ?? null,
  });

  if (error) {
    throw error;
  }
}

export async function queryStatusHistory(
  supabase: FleetOSSupabaseClient,
  scope: OperationalScope,
  entityType: "job" | "run",
  entityId: string,
) {
  const { data, error } = await supabase
    .from("status_history")
    .select("id,entity_type,entity_id,from_status,to_status,changed_by,changed_at,reason")
    .eq("tenant_id", scope.tenantId)
    .eq("organization_id", scope.organizationId)
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("changed_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function queryCustomers(supabase: FleetOSSupabaseClient, scope: OperationalScope) {
  const { data, error } = await supabase
    .from("customers")
    .select("id,name,customer_reference")
    .eq("tenant_id", scope.tenantId)
    .eq("organization_id", scope.organizationId)
    .order("name", { ascending: true })
    .limit(100);

  if (error) throw error;
  return data ?? [];
}

export async function queryPickupLocations(supabase: FleetOSSupabaseClient, scope: OperationalScope) {
  const { data, error } = await supabase
    .from("pickup_locations")
    .select("id,name,suburb,state")
    .eq("tenant_id", scope.tenantId)
    .eq("organization_id", scope.organizationId)
    .order("name", { ascending: true })
    .limit(100);

  if (error) throw error;
  return data ?? [];
}

export async function queryDeliveryLocations(supabase: FleetOSSupabaseClient, scope: OperationalScope) {
  const { data, error } = await supabase
    .from("delivery_locations")
    .select("id,name,suburb,state")
    .eq("tenant_id", scope.tenantId)
    .eq("organization_id", scope.organizationId)
    .order("name", { ascending: true })
    .limit(100);

  if (error) throw error;
  return data ?? [];
}

export async function queryRunOptions(supabase: FleetOSSupabaseClient, scope: OperationalScope) {
  const { data, error } = await supabase
    .from("runs")
    .select("id,run_number,title")
    .eq("tenant_id", scope.tenantId)
    .eq("organization_id", scope.organizationId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;
  return data ?? [];
}
