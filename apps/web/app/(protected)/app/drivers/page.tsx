import { EmptyState, ErrorState } from "../../../../components/states";
import { getJobsRunsServerContext } from "../../../../modules/jobs-runs/server";

export default async function DriversPage() {
  const { supabase, scope } = await getJobsRunsServerContext("organization.read");

  const { data, error } = await supabase
    .from("drivers")
    .select("id,display_name,email,phone,license_number,license_expiry_date,status")
    .eq("tenant_id", scope.tenantId)
    .eq("organization_id", scope.organizationId)
    .order("display_name", { ascending: true })
    .limit(100);

  if (error) {
    return (
      <ErrorState
        title="Drivers unavailable"
        description="FleetOS could not load driver records for this organization."
      />
    );
  }

  const drivers = data ?? [];

  return (
    <div className="module-page">
      <header className="module-header">
        <p className="module-eyebrow">People</p>
        <h1>Drivers</h1>
        <p>Read-only prototype view of organization driver records from the current schema.</p>
      </header>
      {drivers.length === 0 ? (
        <EmptyState title="No drivers found" description="Seeded driver records will appear here." />
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Licence</th><th>Status</th></tr></thead>
            <tbody>
              {drivers.map((driver: any) => (
                <tr key={driver.id}>
                  <td>{driver.display_name}</td>
                  <td>{driver.email ?? "Not set"}</td>
                  <td>{driver.phone ?? "Not set"}</td>
                  <td>{driver.license_number ?? "Not set"}</td>
                  <td>{driver.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
