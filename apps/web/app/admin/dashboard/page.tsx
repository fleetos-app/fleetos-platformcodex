import Link from "next/link";
import { listOrganizations, listTenantInfrastructure } from "../../../modules/super-admin/repository";
import { logSuperAdminAudit, requireSuperAdmin } from "../../../modules/super-admin/server";

export default async function AdminDashboardPage() {
  const { context, serviceSupabase } = await requireSuperAdmin();
  const [{ data }, organizations, infrastructure] = await Promise.all([
    serviceSupabase.auth.admin.listUsers({ page: 1, perPage: 200 }),
    listOrganizations(serviceSupabase),
    listTenantInfrastructure(serviceSupabase),
  ]);

  await logSuperAdminAudit(serviceSupabase, context, {
    action: "super_admin.dashboard.viewed",
    entityTable: "platform_super_admins",
    metadata: { organizations: organizations.length, users: data.users.length },
  });

  return (
    <div className="module-page">
      <header className="module-header">
        <p className="module-eyebrow">FleetOS Internal</p>
        <h1>Platform dashboard</h1>
        <p>Read-only prototype overview for internal platform administration.</p>
      </header>
      <section className="detail-grid">
        <AdminCard label="Organizations" value={organizations.length} href="/admin/organizations" />
        <AdminCard label="Auth users" value={data.users.length} href="/admin/users" />
        <AdminCard label="Infrastructure records" value={infrastructure.length} href="/admin/system-health" />
        <AdminCard label="Billing status" value="V1" href="/admin/billing" />
      </section>
    </div>
  );
}

function AdminCard({
  label,
  value,
  href,
}: {
  label: string;
  value: string | number;
  href: string;
}) {
  return (
    <Link className="detail-card dashboard-card" href={href}>
      <span>{label}</span>
      <strong>{value}</strong>
    </Link>
  );
}
