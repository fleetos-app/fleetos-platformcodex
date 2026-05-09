import { AppShell } from "../../../components/app-shell";
import { getRequiredAuthSession } from "../../../lib/auth/server";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getRequiredAuthSession();
  const activeSession = session.activeMembership
    ? session
    : { ...session, activeMembership: session.memberships[0] };

  if (session.memberships.length === 0) {
    return (
      <main className="foundation-shell">
        <section className="foundation-panel" aria-labelledby="membership-title">
          <p className="eyebrow">FleetOS</p>
          <h1 id="membership-title">No organization access</h1>
          <p className="summary">
            Your sign-in worked, but your user has not been added to an active FleetOS organization yet.
            Ask an administrator to invite you before continuing.
          </p>
          <form action="/auth/logout" method="post" className="inline-action-form">
            <button type="submit">Sign out</button>
          </form>
        </section>
      </main>
    );
  }

  return <AppShell session={activeSession}>{children}</AppShell>;
}
