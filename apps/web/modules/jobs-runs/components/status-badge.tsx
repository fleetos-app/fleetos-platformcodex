import { formatStatus, getStatusTone } from "../status";
import type { JobStatus, RunStatus } from "../types";

export function StatusBadge({ status }: { status: JobStatus | RunStatus }) {
  return <span className={`status-badge tone-${getStatusTone(status)}`}>{formatStatus(status)}</span>;
}
