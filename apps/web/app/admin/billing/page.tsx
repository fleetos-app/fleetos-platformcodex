import { FormMessage } from "../../../components/form-message";
import { SubmitButton } from "../../../components/submit-button";
import { updatePlanLimitsAction } from "../../../modules/super-admin/actions";
import { listOrganizations } from "../../../modules/super-admin/repository";
import { logSuperAdminAudit, requireSuperAdmin } from "../../../modules/super-admin/server";

export default async function AdminBillingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { context, serviceSupabase } = await requireSuperAdmin();
  const organizations = await listOrganizations(serviceSupabase);
  await logSuperAdminAudit(serviceSupabase, context, {
    action: "super_admin.billing.viewed",
    entityTable: "organizations",
    metadata: { count: organizations.length },
  });

  return (
    <div className="module-page">
      <header className="module-header">
        <p className="module-eyebrow">FleetOS Internal</p>
        <h1>Billing and plan limits</h1>
        <p>Payment processor integration is intentionally outside V1. Plan limits and billing status are editable and audited.</p>
      </header>
      <FormMessage error={readParam(params.error)} message={readParam(params.message)} />
      <div className="data-table-wrap">
        <table className="data-table">
          <thead><tr><th>Organization</th><th>Plan</th><th>Billing</th><th>Limits</th><th>Update</th></tr></thead>
          <tbody>
            {organizations.map((organization: any) => {
              const limits = organization.plan_limits ?? {};
              return (
                <tr key={organization.id}>
                  <td>{organization.name}</td>
                  <td>{organization.plan_key}</td>
                  <td>{organization.billing_status}</td>
                  <td>{JSON.stringify(limits)}</td>
                  <td>
                    <form className="inline-grid-form" action={updatePlanLimitsAction}>
                      <input type="hidden" name="organizationId" value={organization.id} />
                      <input name="planKey" defaultValue={organization.plan_key} aria-label="Plan key" />
                      <select name="billingStatus" defaultValue={organization.billing_status} aria-label="Billing status">
                        <option value="trial">trial</option>
                        <option value="active">active</option>
                        <option value="past_due">past_due</option>
                        <option value="paused">paused</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                      <input name="trucks" type="number" defaultValue={limits.trucks ?? 25} aria-label="Truck limit" />
                      <input name="users" type="number" defaultValue={limits.users ?? 10} aria-label="User limit" />
                      <input name="jobsPerMonth" type="number" defaultValue={limits.jobs_per_month ?? 1000} aria-label="Jobs per month" />
                      <SubmitButton pendingLabel="Saving...">Save</SubmitButton>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
