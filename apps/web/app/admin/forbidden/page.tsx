export default function AdminForbiddenPage() {
  return (
    <main className="foundation-shell">
      <section className="foundation-panel" aria-labelledby="admin-forbidden-title">
        <p className="eyebrow">FleetOS Internal</p>
        <h1 id="admin-forbidden-title">Super admin access required</h1>
        <p className="summary">
          This area is restricted to FleetOS internal super admins. Organization roles never grant access here.
        </p>
      </section>
    </main>
  );
}
