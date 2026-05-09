export const vehicleStatuses = ["available", "allocated", "maintenance", "inactive"] as const;
export type VehicleStatus = (typeof vehicleStatuses)[number];

export const vehicleTypes = ["truck", "trailer", "van", "ute", "other"] as const;
export type VehicleType = (typeof vehicleTypes)[number];

export interface FleetScope {
  tenantId: string;
  organizationId: string;
  actorUserId: string;
}

export interface VehicleListFilters {
  search?: string;
  status?: VehicleStatus | "all";
  page?: number;
  pageSize?: number;
  sortBy?: "registration_number" | "name" | "status" | "created_at";
  sortDirection?: "asc" | "desc";
}

export interface VehicleSummary {
  id: string;
  registrationNumber: string;
  fleetNumber: string | null;
  name: string;
  vehicleType: VehicleType;
  status: VehicleStatus;
  refrigerated: boolean;
  temperatureMinC: number | null;
  temperatureMaxC: number | null;
  nextServiceDueAt: string | null;
  odometerKm: number | null;
  notes: string | null;
}

export interface VehicleListResult {
  data: VehicleSummary[];
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
}

export interface UpsertVehicleInput {
  id?: string;
  registrationNumber: string;
  fleetNumber?: string | null;
  name: string;
  vehicleType: VehicleType;
  status: VehicleStatus;
  refrigerated: boolean;
  temperatureMinC?: number | null;
  temperatureMaxC?: number | null;
  nextServiceDueAt?: string | null;
  odometerKm?: number | null;
  notes?: string | null;
}
