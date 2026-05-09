export default function UnauthorizedPage() {
  return (
    <main className="foundation-shell">
      <section className="foundation-panel" aria-labelledby="unauthorized-title">
        <p className="eyebrow">FleetOS</p>
        <h1 id="unauthorized-title">Access denied</h1>
        <p className="summary">Your account does not have access to this area.</p>
      </section>
    </main>
  );
}
