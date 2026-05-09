import { CreateEditDialog } from "../../../../modules/jobs-runs/components/create-edit-dialog";
import { ModuleToolbar } from "../../../../modules/jobs-runs/components/module-toolbar";
import { RunForm } from "../../../../modules/jobs-runs/components/run-form";
import { RunsTable } from "../../../../modules/jobs-runs/components/runs-table";
import { listRuns } from "../../../../modules/jobs-runs/services/jobs-runs-service";
import { getJobsRunsServerContext } from "../../../../modules/jobs-runs/server";
import { runStatuses, type RunStatus } from "../../../../modules/jobs-runs/types";

export default async function RunsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { supabase, scope } = await getJobsRunsServerContext("runs.read");
  const search = readParam(params.search);
  const status = readParam(params.status);
  const page = Number(readParam(params.page) ?? 1);

  const result = await listRuns(supabase, scope, {
    search,
    status: isKnownRunStatus(status) ? status : "all",
    page,
    pageSize: 25,
  });

  return (
    <div className="module-page">
      <header className="module-header split-header">
        <div>
          <p className="module-eyebrow">Operations</p>
          <h1>Runs</h1>
          <p>Multi-stop run planning with driver, subcontractor, vehicle, and status lifecycle foundations.</p>
        </div>
        <CreateEditDialog
          title="Create run"
          description="Create a multi-stop-ready run with dispatch, driver, subcontractor, and vehicle assignment fields."
        >
          <RunForm mode="create" />
        </CreateEditDialog>
      </header>
      <form action="/app/runs">
        <ModuleToolbar
          search={search}
          status={status}
          statuses={runStatuses}
          createLabel="New run"
        />
      </form>
      <RunsTable result={result} />
    </div>
  );
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isKnownRunStatus(value?: string): value is RunStatus {
  return Boolean(value && runStatuses.includes(value as RunStatus));
}
