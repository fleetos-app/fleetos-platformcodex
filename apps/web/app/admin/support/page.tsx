import { createSupportAccessAction } from "../../../modules/super-admin/actions";
import { listOrganizations } from "../../../modules/super-admin/repository";
import { logSuperAdminAudit, requireSuperAdmin } from "../../../modules/super-admin/server";

export default async function AdminSupportPage() {
  const { context, serviceSupabase } = await requireSuperAdmin();
  const [{ data }, organizations] = await Promise.all([
    serviceSupabase.auth.admin.listUsers({ page: 1, perPage: 200 }),
    listOrganizations(serviceSupabase),
  ]);
  await logSuperAdminAudit(serviceSupabase, context, {
    action: "super_admin.support.viewed",
    entityTable: "support_access_sessions",
  });

  return (
    <div className="module-page">
      <header className="module-header">
        <p className="module-eyebrow">FleetOS Internal</p>
        <h1>Support access</h1>
        <p>Support access creates a short-lived audited record. It does not expose service-role keys or bypass server checks.</p>
      </header>
      <section className="timeline-card">
        <h2>Create audited support-access session</h2>
        <form className="dialog-form" action={createSupportAccessAction}>
          <label>
            <span>Organization</span>
            <select name="organizationId" required>
              {organizations.map((organization: any) => (
                <option key={organization.id} value={organization.id}>{organization.name}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Target user</span>
            <select name="targetUserId" required>
              {data.users.map((user) => (
                <option key={user.id} value={user.id}>{user.email ?? user.id}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Reason</span>
            <textarea name="reason" rows={4} required />
          </label>
          <button type="submit">Create support access</button>
        </form>
      </section>
    </div>
  );
}
