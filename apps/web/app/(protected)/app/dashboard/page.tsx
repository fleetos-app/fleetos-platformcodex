import { hasPermission } from "@fleetos/rbac";
import Link from "next/link";
import { listVehicles } from "../../../../modules/fleet/services/vehicles-service";
import { createFleetScope } from "../../../../modules/fleet/services/vehicles-service";
import { listJobs, listRuns } from "../../../../modules/jobs-runs/services/jobs-runs-service";
import { getJobsRunsServerContext } from "../../../../modules/jobs-runs/server";

export default async function DashboardPage() {
  const { supabase, scope, session } = await getJobsRunsServerContext("organization.read");
  const role = session.activeMembership?.role ?? "client";
  const canViewVehicles = hasPermission({ role }, "vehicles.read");
  const fleetScope = createFleetScope({
    tenantId: session.activeMembership?.tenantId,
    organizationId: session.activeMembership?.organizationId,
    actorUserId: session.user.id,
  });
  const [jobs, runs] = await Promise.all([
    listJobs(supabase, scope, { pageSize: 1 }),
    listRuns(supabase, scope, { pageSize: 1 }),
  ]);
  const vehicles = canViewVehicles
    ? await listVehicles(supabase, fleetScope, { pageSize: 1 })
    : null;
  const content = roleDashboardContent(role);

  return (
    <div className="module-page">
      <header className="module-header">
        <p className="module-eyebrow">Overview</p>
        <h1>{content.title}</h1>
        <p>{content.description}</p>
      </header>
      <section className="detail-grid">
        <DashboardCard label={content.jobsLabel} value={jobs.total} href="/app/jobs" />
        <DashboardCard label={content.runsLabel} value={runs.total} href="/app/runs" />
        {vehicles ? <DashboardCard label="Vehicles" value={vehicles.total} href="/app/fleet" /> : null}
        <DashboardCard label="Your role" value={session.activeMembership?.role ?? "member"} href="/app/settings" />
      </section>
      <section className="timeline-card">
        <h2>{session.activeMembership?.organizationName}</h2>
        <p>{content.body}</p>
      </section>
    </div>
  );
}

function DashboardCard({
  label,
  value,
  href,
}: {
  label: string;
  value: string | number;
  href: string;
}) {
  return (
    <Link className="detail-card dashboard-card" href={href}>
      <span>{label}</span>
      <strong>{value}</strong>
    </Link>
  );
}

function roleDashboardContent(role: string) {
  switch (role) {
    case "owner":
    case "admin":
      return {
        title: "Organization command dashboard",
        description: "Manage access, monitor work, and keep Jindal-style transport operations moving.",
        jobsLabel: "Total jobs",
        runsLabel: "Total runs",
        body: "Owners and admins can manage users, vehicles, jobs, runs, settings, and the operational control tower.",
      };
    case "ops_manager":
      return {
        title: "Operations dashboard",
        description: "Dispatch-focused view across jobs, runs, and fleet availability.",
        jobsLabel: "Jobs to coordinate",
        runsLabel: "Runs to dispatch",
        body: "Operations managers can manage jobs, runs, vehicles, and control tower views without platform-admin complexity.",
      };
    case "driver":
      return {
        title: "Driver dashboard",
        description: "Your assigned work and vehicle context in one place.",
        jobsLabel: "Accessible jobs",
        runsLabel: "Accessible runs",
        body: "Driver access is intentionally focused on operational work, not organization administration.",
      };
    case "subcontractor":
      return {
        title: "Subcontractor dashboard",
        description: "A focused view of shared jobs and runs for partner execution.",
        jobsLabel: "Shared jobs",
        runsLabel: "Shared runs",
        body: "Subcontractor access stays scoped to assigned operational work.",
      };
    case "client":
      return {
        title: "Customer dashboard",
        description: "A simple customer-facing view of accessible jobs.",
        jobsLabel: "Visible jobs",
        runsLabel: "Visible runs",
        body: "Customer access is limited and does not expose internal fleet or user-management controls.",
      };
    default:
      return {
        title: "Workspace dashboard",
        description: "Your FleetOS workspace is ready.",
        jobsLabel: "Jobs",
        runsLabel: "Runs",
        body: "Your access is controlled by organization membership and centralized RBAC.",
      };
  }
}
