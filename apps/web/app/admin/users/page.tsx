import { listOrganizationMemberships } from "../../../modules/super-admin/repository";
import { createOrInviteUserAction } from "../../../modules/super-admin/actions";
import { listOrganizations } from "../../../modules/super-admin/repository";
import { logSuperAdminAudit, requireSuperAdmin } from "../../../modules/super-admin/server";

export default async function AdminUsersPage() {
  const { context, serviceSupabase } = await requireSuperAdmin();
  const [{ data }, memberships, organizations] = await Promise.all([
    serviceSupabase.auth.admin.listUsers({ page: 1, perPage: 200 }),
    listOrganizationMemberships(serviceSupabase),
    listOrganizations(serviceSupabase),
  ]);
  await logSuperAdminAudit(serviceSupabase, context, {
    action: "super_admin.users.viewed",
    entityTable: "auth.users",
    metadata: { count: data.users.length },
  });

  return (
    <div className="module-page">
      <header className="module-header">
        <p className="module-eyebrow">FleetOS Internal</p>
        <h1>Users</h1>
        <p>Supabase Auth users and organization memberships for support visibility.</p>
      </header>
      <div className="detail-grid">
        <div className="detail-card"><span>Auth users</span><strong>{data.users.length}</strong></div>
        <div className="detail-card"><span>Memberships</span><strong>{memberships.length}</strong></div>
      </div>
      <section className="timeline-card">
        <h2>Create or invite user</h2>
        <form className="dialog-form compact-form" action={createOrInviteUserAction}>
          <div className="form-grid">
            <label>
              <span>Email</span>
              <input name="email" type="email" required />
            </label>
            <label>
              <span>Temporary password</span>
              <input name="temporaryPassword" type="text" placeholder="Leave blank to send invite email" />
            </label>
          </div>
          <div className="form-grid">
            <label>
              <span>Organization</span>
              <select name="organizationId" required>
                {organizations.map((organization: any) => (
                  <option key={organization.id} value={organization.id}>{organization.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Role</span>
              <select name="roleKey" defaultValue="ops_manager">
                <option value="owner">owner</option>
                <option value="admin">admin</option>
                <option value="ops_manager">ops_manager</option>
                <option value="accounts">accounts</option>
                <option value="driver">driver</option>
                <option value="subcontractor">subcontractor</option>
                <option value="client">client</option>
                <option value="mechanic">mechanic</option>
              </select>
            </label>
          </div>
          <button type="submit">Create or invite user</button>
        </form>
      </section>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead><tr><th>Email</th><th>User ID</th><th>Created</th></tr></thead>
          <tbody>
            {data.users.map((user) => (
              <tr key={user.id}>
                <td>{user.email ?? "No email"}</td>
                <td>{user.id}</td>
                <td>{user.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
