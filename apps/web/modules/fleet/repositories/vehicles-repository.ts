import type { FleetOSSupabaseClient } from "@fleetos/database";
import type { FleetScope, UpsertVehicleInput, VehicleListFilters } from "../types";

function paginationRange(page = 1, pageSize = 25) {
  const safePage = Math.max(1, page);
  const safePageSize = Math.min(Math.max(1, pageSize), 100);
  const from = (safePage - 1) * safePageSize;
  return { page: safePage, pageSize: safePageSize, from, to: from + safePageSize - 1 };
}

export async function queryVehicles(
  supabase: FleetOSSupabaseClient,
  scope: FleetScope,
  filters: VehicleListFilters = {},
) {
  const { page, pageSize, from, to } = paginationRange(filters.page, filters.pageSize);
  const sortBy = filters.sortBy ?? "created_at";
  const sortDirection = filters.sortDirection ?? "desc";

  let query = supabase
    .from("vehicles")
    .select("id,registration_number,fleet_number,name,vehicle_type,status,refrigerated,temperature_min_c,temperature_max_c,next_service_due_at,odometer_km,notes", { count: "exact" })
    .eq("tenant_id", scope.tenantId)
    .eq("organization_id", scope.organizationId);

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.search) {
    query = query.or(`registration_number.ilike.%${filters.search}%,fleet_number.ilike.%${filters.search}%,name.ilike.%${filters.search}%`);
  }

  const { data, error, count } = await query
    .order(sortBy, { ascending: sortDirection === "asc" })
    .range(from, to);

  if (error) throw error;

  return {
    data: data ?? [],
    page,
    pageSize,
    total: count ?? 0,
    pageCount: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
  };
}

export async function insertVehicle(
  supabase: FleetOSSupabaseClient,
  scope: FleetScope,
  input: UpsertVehicleInput,
) {
  const { data, error } = await supabase
    .from("vehicles")
    .insert(toDatabasePayload(scope, input))
    .select("id")
    .single();

  if (error) throw error;
  return data;
}

export async function updateVehicle(
  supabase: FleetOSSupabaseClient,
  scope: FleetScope,
  input: UpsertVehicleInput & { id: string },
) {
  const { data, error } = await supabase
    .from("vehicles")
    .update(toDatabasePayload(scope, input))
    .eq("tenant_id", scope.tenantId)
    .eq("organization_id", scope.organizationId)
    .eq("id", input.id)
    .select("id")
    .single();

  if (error) throw error;
  return data;
}

function toDatabasePayload(scope: FleetScope, input: UpsertVehicleInput) {
  return {
    tenant_id: scope.tenantId,
    organization_id: scope.organizationId,
    registration_number: input.registrationNumber,
    fleet_number: input.fleetNumber ?? null,
    name: input.name,
    vehicle_type: input.vehicleType,
    status: input.status,
    refrigerated: input.refrigerated,
    temperature_min_c: input.temperatureMinC ?? null,
    temperature_max_c: input.temperatureMaxC ?? null,
    next_service_due_at: input.nextServiceDueAt ?? null,
    odometer_km: input.odometerKm ?? null,
    notes: input.notes ?? null,
    created_by: scope.actorUserId,
    updated_by: scope.actorUserId,
  };
}
