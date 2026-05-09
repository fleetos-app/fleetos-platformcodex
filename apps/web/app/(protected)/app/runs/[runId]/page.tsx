import { notFound } from "next/navigation";
import { StatusBadge } from "../../../../../modules/jobs-runs/components/status-badge";
import { StatusTimeline } from "../../../../../modules/jobs-runs/components/timeline";
import { getRunDetails } from "../../../../../modules/jobs-runs/services/jobs-runs-service";
import { getJobsRunsServerContext } from "../../../../../modules/jobs-runs/server";

export default async function RunDetailsPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = await params;
  const { supabase, scope } = await getJobsRunsServerContext();

  try {
    const { run, stops, history } = await getRunDetails(supabase, scope, runId);

    return (
      <div className="module-page">
        <header className="module-header split-header">
          <div>
            <p className="module-eyebrow">Run details</p>
            <h1>{run.runNumber}</h1>
            <p>{run.title}</p>
          </div>
          <StatusBadge status={run.status} />
        </header>
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
