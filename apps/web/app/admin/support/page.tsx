import { FormMessage } from "../../../components/form-message";
import { SubmitButton } from "../../../components/submit-button";
import { createSupportAccessAction } from "../../../modules/super-admin/actions";
import { listOrganizations } from "../../../modules/super-admin/repository";
import { logSuperAdminAudit, requireSuperAdmin } from "../../../modules/super-admin/server";

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
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
      <FormMessage error={readParam(params.error)} message={readParam(params.message)} />
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
          <SubmitButton pendingLabel="Saving...">Create support access</SubmitButton>
        </form>
      </section>
    </div>
  );
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
