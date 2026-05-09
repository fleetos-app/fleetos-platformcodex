import { createOrganizationAction, reactivateOrganizationAction, suspendOrganizationAction } from "../../../modules/super-admin/actions";
import { listOrganizations } from "../../../modules/super-admin/repository";
import { logSuperAdminAudit, requireSuperAdmin } from "../../../modules/super-admin/server";

export default async function AdminOrganizationsPage() {
  const { context, serviceSupabase } = await requireSuperAdmin();
  const organizations = await listOrganizations(serviceSupabase);
  await logSuperAdminAudit(serviceSupabase, context, {
    action: "super_admin.organizations.viewed",
    entityTable: "organizations",
    metadata: { count: organizations.length },
  });

  return (
    <div className="module-page">
      <header className="module-header">
        <p className="module-eyebrow">FleetOS Internal</p>
        <h1>Organizations</h1>
        <p>View and manage customer organization status through audited server-side actions.</p>
      </header>
      <section className="timeline-card">
        <h2>Create organization</h2>
        <form className="dialog-form compact-form" action={createOrganizationAction}>
          <div className="form-grid">
            <label>
              <span>Name</span>
              <input name="name" required placeholder="Northline Cold Freight" />
            </label>
            <label>
              <span>Slug</span>
              <input name="slug" placeholder="northline-cold-freight" />
            </label>
          </div>
          <label>
            <span>Plan</span>
            <input name="planKey" defaultValue="starter" />
          </label>
          <button type="submit">Create organization</button>
        </form>
      </section>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Plan</th>
              <th>Billing</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {organizations.map((organization: any) => (
              <tr key={organization.id}>
                <td>
                  <strong>{organization.name}</strong>
                  <small>{organization.slug}</small>
                </td>
                <td>{organization.status}</td>
                <td>{organization.plan_key}</td>
                <td>{organization.billing_status}</td>
                <td>
                  <div className="table-actions">
                    <form action={suspendOrganizationAction}>
                      <input type="hidden" name="organizationId" value={organization.id} />
                      <button type="submit" disabled={organization.status === "suspended"}>Suspend</button>
                    </form>
                    <form action={reactivateOrganizationAction}>
                      <input type="hidden" name="organizationId" value={organization.id} />
                      <button type="submit" disabled={organization.status === "active"}>Reactivate</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
