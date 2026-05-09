import type { FleetOSPermission } from "@fleetos/rbac";

export const jobsRunsPermissions = {
  readJobs: "jobs.read",
  writeJobs: "jobs.write",
  readRuns: "runs.read",
  writeRuns: "runs.write",
} as const satisfies Record<string, FleetOSPermission>;
