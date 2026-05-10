import Link from "next/link";

const adminNav = [
  ["Dashboard", "/admin/dashboard"],
  ["Organizations", "/admin/organizations"],
  ["Users", "/admin/users"],
  ["Billing", "/admin/billing"],
  ["Support", "/admin/support"],
  ["System Health", "/admin/system-health"],
] as const;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">F</div>
          <div>
            <span>FleetOS</span>
            <small>Super admin</small>
          </div>
        </div>
        <nav className="sidebar-nav">
          {adminNav.map(([label, href]) => (
            <Link key={href} className="nav-link" href={href}>{label}</Link>
          ))}
        </nav>
        <p className="admin-user">FleetOS internal</p>
      </aside>
      <main className="content-shell">{children}</main>
    </div>
  );
}
