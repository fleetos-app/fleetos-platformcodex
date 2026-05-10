import Link from "next/link";
import { EmptyState } from "../../../components/states";
import { StatusBadge } from "./status-badge";
import type { PaginatedResult, RunSummary } from "../types";

export function RunsTable({ result }: { result: PaginatedResult<RunSummary> }) {
  if (result.data.length === 0) {
    return (
      <EmptyState
        title="No runs found"
        description="Runs will coordinate jobs, stops, drivers, subcontractors, and vehicles when workflows are added."
      />
    );
  }

  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Run</th>
            <th>Status</th>
            <th>Planned start</th>
            <th>Driver</th>
            <th>Vehicle</th>
            <th>Stops</th>
          </tr>
        </thead>
        <tbody>
          {result.data.map((run) => (
            <tr key={run.id}>
              <td>
                <Link href={`/app/runs/${run.id}`}>{run.runNumber}</Link>
                <small>{run.title}</small>
              </td>
              <td><StatusBadge status={run.status} /></td>
              <td>{run.plannedStartAt ? new Date(run.plannedStartAt).toLocaleString() : "TBC"}</td>
              <td>{run.driverUserId ?? "Unassigned"}</td>
              <td>{run.vehicleId ?? "Unassigned"}</td>
              <td>{run.stopCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination-meta">
        Page {result.page} of {result.pageCount} - {result.total} records
      </div>
    </div>
  );
}
