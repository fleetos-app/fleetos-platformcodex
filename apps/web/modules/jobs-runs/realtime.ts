import type { OperationalScope } from "./types";

export function jobsRunsRealtimeChannel(scope: OperationalScope) {
  return `jobs-runs:${scope.tenantId}:${scope.organizationId}`;
}

export const jobsRunsRealtimeTables = [
  "jobs",
  "runs",
  "run_stops",
  "allocations",
  "status_history",
] as const;
