import { listTenantInfrastructure } from "../../../modules/super-admin/repository";
import { logSuperAdminAudit, requireSuperAdmin } from "../../../modules/super-admin/server";

export default async function AdminSystemHealthPage() {
  const { context, serviceSupabase } = await requireSuperAdmin();
  const infrastructure = await listTenantInfrastructure(serviceSupabase);
  await logSuperAdminAudit(serviceSupabase, context, {
    action: "super_admin.system_health.viewed",
    entityTable: "tenant_infrastructure",
    metadata: { count: infrastructure.length },
  });

  return (
    <div className="module-page">
      <header className="module-header">
        <p className="module-eyebrow">FleetOS Internal</p>
        <h1>System health</h1>
        <p>Shared Supabase V1 health visibility with future enterprise infrastructure readiness.</p>
      </header>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead><tr><th>Tenant</th><th>Region</th><th>Project</th><th>Status</th><th>Updated</th></tr></thead>
          <tbody>
            {infrastructure.length === 0 ? (
              <tr><td colSpan={5}>No dedicated tenant infrastructure records yet. V1 runs on shared Supabase.</td></tr>
            ) : infrastructure.map((item: any) => (
              <tr key={item.id}>
                <td>{item.tenant_id}</td>
                <td>{item.region ?? "shared"}</td>
                <td>{item.supabase_project_ref ?? "shared"}</td>
                <td>{item.status}</td>
                <td>{item.updated_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
