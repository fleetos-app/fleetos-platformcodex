export const jobStatuses = [
  "pending",
  "allocated",
  "in_progress",
  "completed",
  "cancelled",
  "issue_reported",
] as const;

export type JobStatus = (typeof jobStatuses)[number];

export const runStatuses = [
  "planned",
  "dispatched",
  "started",
  "loading",
  "enroute",
  "delivered",
  "completed",
] as const;

export type RunStatus = (typeof runStatuses)[number];

export interface OperationalScope {
  tenantId: string;
  organizationId: string;
  actorUserId: string;
}

export interface PaginationInput {
  page?: number;
  pageSize?: number;
}

export interface SortInput<TSort extends string> {
  sortBy?: TSort;
  sortDirection?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
}

export interface JobListFilters extends PaginationInput, SortInput<"created_at" | "requested_pickup_at" | "status" | "title"> {
  search?: string;
  status?: JobStatus | "all";
}

export interface RunListFilters extends PaginationInput, SortInput<"created_at" | "planned_start_at" | "status" | "run_number"> {
  search?: string;
  status?: RunStatus | "all";
}

export interface CustomerSummary {
  id: string;
  name: string;
  customerReference: string | null;
}

export interface SelectOption {
  id: string;
  label: string;
}

export interface LocationSummary {
  id: string;
  name: string;
  suburb: string | null;
  state: string | null;
}

export interface JobSummary {
  id: string;
  title: string;
  status: JobStatus;
  customerReference: string | null;
  internalReference: string | null;
  requestedPickupAt: string | null;
  requestedDeliveryAt: string | null;
  notes: string | null;
  temperatureMinC: number | null;
  temperatureMaxC: number | null;
  podRequired: boolean;
  driverUserId?: string | null;
  subcontractorId?: string | null;
  vehicleId?: string | null;
  customer?: CustomerSummary;
  pickupLocation?: LocationSummary;
  deliveryLocation?: LocationSummary;
  createdAt: string;
}

export interface RunSummary {
  id: string;
  runNumber: string;
  title: string;
  status: RunStatus;
  plannedStartAt: string | null;
  plannedEndAt: string | null;
  notes: string | null;
  driverUserId: string | null;
  subcontractorId: string | null;
  vehicleId: string | null;
  stopCount: number;
  createdAt: string;
}

export interface RunStop {
  id: string;
  runId: string;
  jobId: string | null;
  stopType: "pickup" | "delivery" | "break" | "depot" | "other";
  sequence: number;
  locationName: string;
  plannedArrivalAt: string | null;
  actualArrivalAt: string | null;
}

export interface StatusHistoryEntry {
  id: string;
  entityType: "job" | "run";
  entityId: string;
  fromStatus: string | null;
  toStatus: string;
  changedBy: string | null;
  changedAt: string;
  reason: string | null;
}

export interface CreateJobInput {
  customerId: string;
  pickupLocationId?: string | null;
  deliveryLocationId?: string | null;
  title: string;
  customerReference?: string | null;
  internalReference?: string | null;
  notes?: string | null;
  requestedPickupAt?: string | null;
  requestedDeliveryAt?: string | null;
  temperatureMinC?: number | null;
  temperatureMaxC?: number | null;
  podRequired?: boolean;
  runId?: string | null;
  driverUserId?: string | null;
  subcontractorId?: string | null;
  vehicleId?: string | null;
}

export interface UpdateJobInput extends Partial<CreateJobInput> {
  id: string;
  status?: JobStatus;
}

export interface CreateRunInput {
  runNumber: string;
  title: string;
  plannedStartAt?: string | null;
  plannedEndAt?: string | null;
  driverUserId?: string | null;
  subcontractorId?: string | null;
  vehicleId?: string | null;
  notes?: string | null;
}

export interface UpdateRunInput extends Partial<CreateRunInput> {
  id: string;
  status?: RunStatus;
}
