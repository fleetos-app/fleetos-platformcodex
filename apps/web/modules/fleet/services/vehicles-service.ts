import { logAuthAuditEvent } from "@fleetos/auth";
import type { FleetOSSupabaseClient } from "@fleetos/database";
import { insertVehicle, queryVehicles, updateVehicle } from "../repositories/vehicles-repository";
import type { FleetScope, UpsertVehicleInput, VehicleListFilters, VehicleListResult, VehicleStatus, VehicleSummary, VehicleType } from "../types";
import { vehicleStatuses, vehicleTypes } from "../types";

export function createFleetScope(input: {
  tenantId?: string;
  organizationId?: string;
  actorUserId: string;
}): FleetScope {
  if (!input.tenantId || !input.organizationId) {
    throw new Error("Active organization membership is required.");
  }

  return {
    tenantId: input.tenantId,
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
  };
}

export async function listVehicles(
  supabase: FleetOSSupabaseClient,
  scope: FleetScope,
  filters: VehicleListFilters = {},
): Promise<VehicleListResult> {
  const result = await queryVehicles(supabase, scope, filters);
  return {
    ...result,
    data: result.data.map(mapVehicle),
  };
}

export async function createVehicle(
  supabase: FleetOSSupabaseClient,
  scope: FleetScope,
  input: UpsertVehicleInput,
) {
  validateTemperatureRange(input.temperatureMinC, input.temperatureMaxC);
  const vehicle = await insertVehicle(supabase, scope, input);
  await logAuthAuditEvent(supabase, {
    tenantId: scope.tenantId,
    organizationId: scope.organizationId,
    actorUserId: scope.actorUserId,
    action: "auth.sensitive_access",
    entityTable: "vehicles",
    entityId: vehicle.id,
    metadata: { operation: "vehicle.create", registration_number: input.registrationNumber },
  });
  return vehicle;
}

export async function saveVehicle(
  supabase: FleetOSSupabaseClient,
  scope: FleetScope,
  input: UpsertVehicleInput & { id: string },
) {
  validateTemperatureRange(input.temperatureMinC, input.temperatureMaxC);
  const vehicle = await updateVehicle(supabase, scope, input);
  await logAuthAuditEvent(supabase, {
    tenantId: scope.tenantId,
    organizationId: scope.organizationId,
    actorUserId: scope.actorUserId,
    action: "auth.sensitive_access",
    entityTable: "vehicles",
    entityId: vehicle.id,
    metadata: { operation: "vehicle.update", registration_number: input.registrationNumber },
  });
  return vehicle;
}

export function isVehicleStatus(value?: string | null): value is VehicleStatus {
  return Boolean(value && vehicleStatuses.includes(value as VehicleStatus));
}

export function isVehicleType(value?: string | null): value is VehicleType {
  return Boolean(value && vehicleTypes.includes(value as VehicleType));
}

function validateTemperatureRange(min?: number | null, max?: number | null) {
  if (min == null || max == null) return;
  if (min > max) {
    throw new Error("Minimum temperature cannot be greater than maximum temperature.");
  }
}

function mapVehicle(row: any): VehicleSummary {
  return {
    id: row.id,
    registrationNumber: row.registration_number,
    fleetNumber: row.fleet_number,
    name: row.name,
    vehicleType: row.vehicle_type,
    status: row.status,
    refrigerated: row.refrigerated,
    temperatureMinC: row.temperature_min_c,
    temperatureMaxC: row.temperature_max_c,
    nextServiceDueAt: row.next_service_due_at,
    odometerKm: row.odometer_km,
    notes: row.notes,
  };
}
