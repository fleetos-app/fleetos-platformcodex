import Link from "next/link";
import { EmptyState } from "../../../components/states";
import { StatusBadge } from "./status-badge";
import type { JobSummary, PaginatedResult } from "../types";

export function JobsTable({ result }: { result: PaginatedResult<JobSummary> }) {
  if (result.data.length === 0) {
    return (
      <EmptyState
        title="No jobs found"
        description="Create the first job when customer, location, and allocation workflows are ready."
      />
    );
  }

  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Job</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Pickup</th>
            <th>Delivery</th>
            <th>Temperature</th>
            <th>POD</th>
          </tr>
        </thead>
        <tbody>
          {result.data.map((job) => (
            <tr key={job.id}>
              <td>
                <Link href={`/app/jobs/${job.id}`}>{job.title}</Link>
                <small>{job.internalReference ?? job.customerReference ?? "No reference"}</small>
              </td>
              <td>{job.customer?.name ?? "Unassigned"}</td>
              <td><StatusBadge status={job.status} /></td>
              <td>{job.pickupLocation?.name ?? "TBC"}</td>
              <td>{job.deliveryLocation?.name ?? "TBC"}</td>
              <td>{formatTemperature(job.temperatureMinC, job.temperatureMaxC)}</td>
              <td>{job.podRequired ? "Required" : "Optional"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <PaginationMeta page={result.page} pageCount={result.pageCount} total={result.total} />
    </div>
  );
}

function formatTemperature(min: number | null, max: number | null) {
  if (min == null && max == null) {
    return "Ambient";
  }

  return `${min ?? "-"}°C to ${max ?? "-"}°C`;
}

function PaginationMeta({ page, pageCount, total }: { page: number; pageCount: number; total: number }) {
  return (
    <div className="pagination-meta">
      Page {page} of {pageCount} · {total} records
    </div>
  );
}
