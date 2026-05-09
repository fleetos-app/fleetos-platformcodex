import { CreateEditDialog } from "../../../../modules/jobs-runs/components/create-edit-dialog";
import { JobForm } from "../../../../modules/jobs-runs/components/job-form";
import { JobsTable } from "../../../../modules/jobs-runs/components/jobs-table";
import { ModuleToolbar } from "../../../../modules/jobs-runs/components/module-toolbar";
import { getJobFormOptions, listJobs } from "../../../../modules/jobs-runs/services/jobs-runs-service";
import { jobStatuses, type JobStatus } from "../../../../modules/jobs-runs/types";
import { getJobsRunsServerContext } from "../../../../modules/jobs-runs/server";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { supabase, scope } = await getJobsRunsServerContext("jobs.read");
  const search = readParam(params.search);
  const status = readParam(params.status);
  const page = Number(readParam(params.page) ?? 1);

  const [result, options] = await Promise.all([
    listJobs(supabase, scope, {
      search,
      status: isKnownJobStatus(status) ? status : "all",
      page,
      pageSize: 25,
    }),
    getJobFormOptions(supabase, scope),
  ]);

  return (
    <div className="module-page">
      <header className="module-header split-header">
        <div>
          <p className="module-eyebrow">Operations</p>
          <h1>Jobs</h1>
          <p>Customer transport jobs with allocation, timing, temperature, and POD-ready structure.</p>
        </div>
        <CreateEditDialog
          title="Create job"
          description="Create a tenant-scoped transport job with references, time windows, temperature fields, and allocation."
        >
          <JobForm mode="create" options={options} />
        </CreateEditDialog>
      </header>
      <form action="/app/jobs">
        <ModuleToolbar
          search={search}
          status={status}
          statuses={jobStatuses}
          createLabel="New job"
        />
      </form>
      <JobsTable result={result} />
    </div>
  );
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isKnownJobStatus(value?: string): value is JobStatus {
  return Boolean(value && jobStatuses.includes(value as JobStatus));
}
