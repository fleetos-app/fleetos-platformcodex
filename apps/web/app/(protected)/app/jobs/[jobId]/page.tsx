import { notFound } from "next/navigation";
import { StatusBadge } from "../../../../../modules/jobs-runs/components/status-badge";
import { StatusTimeline } from "../../../../../modules/jobs-runs/components/timeline";
import { getJobDetails } from "../../../../../modules/jobs-runs/services/jobs-runs-service";
import { getJobsRunsServerContext } from "../../../../../modules/jobs-runs/server";

export default async function JobDetailsPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const { supabase, scope } = await getJobsRunsServerContext();

  try {
    const { job, history } = await getJobDetails(supabase, scope, jobId);

    return (
      <div className="module-page">
        <header className="module-header split-header">
          <div>
            <p className="module-eyebrow">Job details</p>
            <h1>{job.title}</h1>
            <p>{job.internalReference ?? job.customerReference ?? "No reference"}</p>
          </div>
          <StatusBadge status={job.status} />
        </header>
        <section className="detail-grid">
          <Detail label="Customer" value={job.customer?.name ?? "Unassigned"} />
          <Detail label="Pickup" value={job.pickupLocation?.name ?? "TBC"} />
          <Detail label="Delivery" value={job.deliveryLocation?.name ?? "TBC"} />
          <Detail label="POD" value={job.podRequired ? "Required" : "Optional"} />
        </section>
        <StatusTimeline entries={history} />
      </div>
    );
  } catch {
    notFound();
  }
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
