import { fleetOSRoles } from "@fleetos/rbac";
import { guardPermission } from "../../../../lib/auth/server";
import { changeOrganizationUserRoleAction, createOrganizationUserAction } from "../../../../modules/user-management/actions";
import { createUserManagementScope, listOrganizationUsers } from "../../../../modules/user-management/service";

export default async function UsersPage() {
  const session = await guardPermission("users.read");
  const scope = createUserManagementScope({
    tenantId: session.activeMembership?.tenantId,
    organizationId: session.activeMembership?.organizationId,
    actorUserId: session.user.id,
  });
  const users = await listOrganizationUsers(scope);

  return (
    <div className="module-page">
      <header className="module-header">
        <p className="module-eyebrow">Access</p>
        <h1>User management</h1>
        <p>Invite staff, drivers, subcontractors, clients, mechanics, and accounts users into this organization.</p>
      </header>
      <section className="timeline-card">
        <h2>Invite or create user</h2>
        <form className="dialog-form compact-form" action={createOrganizationUserAction}>
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
          <label>
            <span>Role</span>
            <select name="role" defaultValue="driver">
              {fleetOSRoles.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
          </label>
          <button type="submit">Invite user</button>
        </form>
      </section>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Change role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.membershipId}>
                <td>
                  <strong>{user.email}</strong>
                  <small>{user.userId}</small>
                </td>
                <td>{user.role}</td>
                <td>{user.status}</td>
                <td>
                  <form className="table-actions" action={changeOrganizationUserRoleAction}>
                    <input type="hidden" name="membershipId" value={user.membershipId} />
                    <select name="role" defaultValue={user.role} aria-label={`Role for ${user.email}`}>
                      {fleetOSRoles.map((role) => <option key={role} value={role}>{role}</option>)}
                    </select>
                    <button type="submit">Save</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
