import { notFound } from "next/navigation";
import { FormMessage } from "../../../../../components/form-message";
import { StatusBadge } from "../../../../../modules/jobs-runs/components/status-badge";
import { StatusTimeline } from "../../../../../modules/jobs-runs/components/timeline";
import { CreateEditDialog } from "../../../../../modules/jobs-runs/components/create-edit-dialog";
import { RunForm } from "../../../../../modules/jobs-runs/components/run-form";
import { getRunDetails, getRunFormOptions } from "../../../../../modules/jobs-runs/services/jobs-runs-service";
import { getJobsRunsServerContext } from "../../../../../modules/jobs-runs/server";

export default async function RunDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ runId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { runId } = await params;
  const query = await searchParams;
  const { supabase, scope } = await getJobsRunsServerContext("runs.read");

  try {
    const [{ run, stops, history }, options] = await Promise.all([
      getRunDetails(supabase, scope, runId),
      getRunFormOptions(supabase, scope),
    ]);

    return (
      <div className="module-page">
        <header className="module-header split-header">
          <div>
            <p className="module-eyebrow">Run details</p>
            <h1>{run.runNumber}</h1>
            <p>{run.title}</p>
          </div>
          <div className="header-actions">
            <StatusBadge status={run.status} />
            <CreateEditDialog title="Edit run" description="Update run details through the service layer.">
              <RunForm mode="edit" run={run} options={options} />
            </CreateEditDialog>
          </div>
        </header>
        <FormMessage error={readParam(query.error)} message={readParam(query.message)} />
        <section className="detail-grid">
          <Detail label="Driver" value={run.driverUserId ?? "Unassigned"} />
          <Detail label="Vehicle" value={run.vehicleId ?? "Unassigned"} />
          <Detail label="Stops" value={String(run.stopCount)} />
          <Detail label="Planned start" value={run.plannedStartAt ?? "TBC"} />
        </section>
        <section className="timeline-card">
          <h2>Stops</h2>
          {stops.length === 0 ? <p>No stops have been assigned yet.</p> : null}
          <ol className="timeline-list">
            {stops.map((stop: any) => (
              <li key={stop.id}>
                <strong>{stop.sequence}. {stop.location_name}</strong>
                <span>{stop.stop_type}</span>
              </li>
            ))}
          </ol>
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
