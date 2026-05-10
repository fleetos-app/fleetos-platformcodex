import { EmptyState, ErrorState } from "../../../../components/states";
import { getJobsRunsServerContext } from "../../../../modules/jobs-runs/server";

export default async function SubcontractorsPage() {
  const { supabase, scope } = await getJobsRunsServerContext("organization.read");

  const { data, error } = await supabase
    .from("subcontractors")
    .select("id,company_name,contact_name,email,phone,abn,status")
    .eq("tenant_id", scope.tenantId)
    .eq("organization_id", scope.organizationId)
    .order("company_name", { ascending: true })
    .limit(100);

  if (error) {
    return (
      <ErrorState
        title="Subcontractors unavailable"
        description="FleetOS could not load subcontractor records for this organization."
      />
    );
  }

  const subcontractors = data ?? [];

  return (
    <div className="module-page">
      <header className="module-header">
        <p className="module-eyebrow">Partners</p>
        <h1>Subcontractors</h1>
        <p>Read-only prototype view of organization subcontractor records from the current schema.</p>
      </header>
      {subcontractors.length === 0 ? (
        <EmptyState title="No subcontractors found" description="Seeded subcontractor records will appear here." />
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th>Company</th><th>Contact</th><th>Email</th><th>Phone</th><th>Status</th></tr></thead>
            <tbody>
              {subcontractors.map((subcontractor: any) => (
                <tr key={subcontractor.id}>
                  <td>{subcontractor.company_name}</td>
                  <td>{subcontractor.contact_name ?? "Not set"}</td>
                  <td>{subcontractor.email ?? "Not set"}</td>
                  <td>{subcontractor.phone ?? "Not set"}</td>
                  <td>{subcontractor.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
