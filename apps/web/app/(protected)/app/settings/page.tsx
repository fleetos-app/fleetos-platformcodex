import { guardPermission } from "../../../../lib/auth/server";

export default async function SettingsPage() {
  const session = await guardPermission("role.read");
  const activeMembership = session.activeMembership;

  return (
    <div className="module-page">
      <header className="module-header">
        <p className="module-eyebrow">Administration</p>
        <h1>Settings</h1>
        <p>Organization access and current session context are loaded through centralized auth and RBAC.</p>
      </header>
      <section className="detail-grid">
        <Detail label="Organization" value={activeMembership?.organizationName ?? "None"} />
        <Detail label="Organization ID" value={activeMembership?.organizationId ?? "None"} />
        <Detail label="Tenant ID" value={activeMembership?.tenantId ?? "None"} />
        <Detail label="Your role" value={activeMembership?.role ?? "None"} />
      </section>
      <section className="timeline-card">
        <h2>Memberships</h2>
        <ol className="timeline-list">
          {session.memberships.map((membership) => (
            <li key={membership.id}>
              <strong>{membership.organizationName}</strong>
              <span>{membership.role} - {membership.status}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
