import { jobStatuses, runStatuses, type JobStatus, type RunStatus } from "./types";

export function isJobStatus(value: string): value is JobStatus {
  return jobStatuses.includes(value as JobStatus);
}

export function isRunStatus(value: string): value is RunStatus {
  return runStatuses.includes(value as RunStatus);
}

export function getStatusTone(status: JobStatus | RunStatus) {
  if (["completed", "delivered"].includes(status)) {
    return "success";
  }

  if (["cancelled", "issue_reported"].includes(status)) {
    return "danger";
  }

  if (["allocated", "dispatched", "started", "loading", "enroute", "in_progress"].includes(status)) {
    return "active";
  }

  return "neutral";
}

export function formatStatus(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
