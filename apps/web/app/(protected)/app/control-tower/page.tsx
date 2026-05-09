import { listVehicles } from "../../../../modules/fleet/services/vehicles-service";
import { createFleetScope } from "../../../../modules/fleet/services/vehicles-service";
import { listJobs, listRuns } from "../../../../modules/jobs-runs/services/jobs-runs-service";
import { getJobsRunsServerContext } from "../../../../modules/jobs-runs/server";

export default async function ControlTowerPage() {
  const { supabase, scope, session } = await getJobsRunsServerContext("control_tower.read");
  const fleetScope = createFleetScope({
    tenantId: session.activeMembership?.tenantId,
    organizationId: session.activeMembership?.organizationId,
    actorUserId: session.user.id,
  });
  const [pendingJobs, activeJobs, plannedRuns, dispatchedRuns, vehicles, maintenanceVehicles] =
    await Promise.all([
      listJobs(supabase, scope, { status: "pending", pageSize: 5 }),
      listJobs(supabase, scope, { status: "in_progress", pageSize: 5 }),
      listRuns(supabase, scope, { status: "planned", pageSize: 5 }),
      listRuns(supabase, scope, { status: "dispatched", pageSize: 5 }),
      listVehicles(supabase, fleetScope, { pageSize: 1 }),
      listVehicles(supabase, fleetScope, { status: "maintenance", pageSize: 1 }),
    ]);

  return (
    <div className="module-page">
      <header className="module-header">
        <p className="module-eyebrow">Operations</p>
        <h1>Operational control tower</h1>
        <p>Fast operational overview across jobs, runs, fleet readiness, and exception pressure.</p>
      </header>
      <section className="detail-grid">
        <Metric label="Pending jobs" value={pendingJobs.total} />
        <Metric label="In-progress jobs" value={activeJobs.total} />
        <Metric label="Planned runs" value={plannedRuns.total} />
        <Metric label="Dispatched runs" value={dispatchedRuns.total} />
        <Metric label="Fleet assets" value={vehicles.total} />
        <Metric label="In maintenance" value={maintenanceVehicles.total} />
      </section>
      <section className="control-grid">
        <ControlPanel title="Pending jobs" items={pendingJobs.data.map((job) => job.title)} />
        <ControlPanel title="Planned runs" items={plannedRuns.data.map((run) => `${run.runNumber} - ${run.title}`)} />
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="detail-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ControlPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="timeline-card">
      <h2>{title}</h2>
      {items.length === 0 ? <p>No records need attention.</p> : null}
      <ol className="timeline-list">
        {items.map((item) => (
          <li key={item}>
            <strong>{item}</strong>
          </li>
        ))}
      </ol>
    </section>
  );
}
