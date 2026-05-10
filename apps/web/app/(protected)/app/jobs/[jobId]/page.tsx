import { notFound } from "next/navigation";
import { FormMessage } from "../../../../../components/form-message";
import { StatusBadge } from "../../../../../modules/jobs-runs/components/status-badge";
import { StatusTimeline } from "../../../../../modules/jobs-runs/components/timeline";
import { CreateEditDialog } from "../../../../../modules/jobs-runs/components/create-edit-dialog";
import { JobForm } from "../../../../../modules/jobs-runs/components/job-form";
import { getJobDetails, getJobFormOptions } from "../../../../../modules/jobs-runs/services/jobs-runs-service";
import { getJobsRunsServerContext } from "../../../../../modules/jobs-runs/server";

export default async function JobDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ jobId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { jobId } = await params;
  const query = await searchParams;
  const { supabase, scope } = await getJobsRunsServerContext("jobs.read");

  try {
    const [{ job, history }, options] = await Promise.all([
      getJobDetails(supabase, scope, jobId),
      getJobFormOptions(supabase, scope),
    ]);

    return (
      <div className="module-page">
        <header className="module-header split-header">
          <div>
            <p className="module-eyebrow">Job details</p>
            <h1>{job.title}</h1>
            <p>{job.internalReference ?? job.customerReference ?? "No reference"}</p>
          </div>
          <div className="header-actions">
            <StatusBadge status={job.status} />
            <CreateEditDialog title="Edit job" description="Update job details through the service layer.">
              <JobForm mode="edit" job={job} options={options} />
            </CreateEditDialog>
          </div>
        </header>
        <FormMessage error={readParam(query.error)} message={readParam(query.message)} />
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

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
