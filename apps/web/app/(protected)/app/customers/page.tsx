import { EmptyState, ErrorState } from "../../../../components/states";
import { getJobsRunsServerContext } from "../../../../modules/jobs-runs/server";

export default async function CustomersPage() {
  const { supabase, scope } = await getJobsRunsServerContext("organization.read");

  const { data, error } = await supabase
    .from("customers")
    .select("id,name,email,phone,customer_reference")
    .eq("tenant_id", scope.tenantId)
    .eq("organization_id", scope.organizationId)
    .order("name", { ascending: true })
    .limit(100);

  if (error) {
    return (
      <ErrorState
        title="Customers unavailable"
        description="FleetOS could not load customer records for this organization."
      />
    );
  }

  const customers = data ?? [];

  return (
    <div className="module-page">
      <header className="module-header">
        <p className="module-eyebrow">Customers</p>
        <h1>Customers</h1>
        <p>Read-only prototype view of customer records available to Jobs and Runs.</p>
      </header>
      {customers.length === 0 ? (
        <EmptyState title="No customers found" description="Seeded customer records will appear here." />
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Reference</th><th>Email</th><th>Phone</th></tr></thead>
            <tbody>
              {customers.map((customer: any) => (
                <tr key={customer.id}>
                  <td>{customer.name}</td>
                  <td>{customer.customer_reference ?? "Not set"}</td>
                  <td>{customer.email ?? "Not set"}</td>
                  <td>{customer.phone ?? "Not set"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
