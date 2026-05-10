import { FormMessage } from "../../../components/form-message";
import { SubmitButton } from "../../../components/submit-button";
import { createOrganizationAction, reactivateOrganizationAction, suspendOrganizationAction } from "../../../modules/super-admin/actions";
import { listOrganizations } from "../../../modules/super-admin/repository";
import { logSuperAdminAudit, requireSuperAdmin } from "../../../modules/super-admin/server";

export default async function AdminOrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
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
      <FormMessage error={readParam(params.error)} message={readParam(params.message)} />
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
          <SubmitButton pendingLabel="Creating...">Create organization</SubmitButton>
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
                      <SubmitButton pendingLabel="Saving..." disabled={organization.status === "suspended"}>Suspend</SubmitButton>
                    </form>
                    <form action={reactivateOrganizationAction}>
                      <input type="hidden" name="organizationId" value={organization.id} />
                      <SubmitButton pendingLabel="Saving..." disabled={organization.status === "active"}>Reactivate</SubmitButton>
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

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
