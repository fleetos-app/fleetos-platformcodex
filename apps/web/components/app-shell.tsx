"use client";

import type { AuthSession } from "@fleetos/auth";
import { hasPermission } from "@fleetos/rbac";
import {
  BriefcaseBusiness,
  ClipboardCheck,
  Gauge,
  Menu,
  RadioTower,
  Truck,
  UsersRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState, type PropsWithChildren } from "react";
import { appNavigationItems, type AppModuleKey } from "../lib/navigation";
import { ThemeToggle } from "./theme-toggle";

const moduleIcons: Record<AppModuleKey, LucideIcon> = {
  dashboard: Gauge,
  control_tower: RadioTower,
  jobs: BriefcaseBusiness,
  runs: ClipboardCheck,
  fleet: Truck,
  users: UsersRound,
  settings: Wrench,
};

export function AppShell({
  children,
  session,
}: PropsWithChildren<{
  session: AuthSession;
}>) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activeMembership = session.activeMembership;
  const currentRole = activeMembership?.role ?? "client";
  const organizations = session.memberships;

  const navItems = useMemo(
    () =>
      appNavigationItems.filter((item) => {
        if (!item.permission) {
          return true;
        }

        return hasPermission({ role: currentRole }, item.permission);
      }),
    [currentRole],
  );

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "is-open" : ""}`} aria-label="Primary navigation">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">F</div>
          <div>
            <span>FleetOS</span>
            <small>Operations</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = moduleIcons[item.key];
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.key}
                className={`nav-link ${isActive ? "is-active" : ""}`}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {sidebarOpen ? (
        <button
          className="sidebar-scrim"
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <div className="app-main">
        <header className="topbar">
          <button
            className="icon-button mobile-only"
            type="button"
            aria-label="Open navigation"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={18} aria-hidden="true" />
          </button>

          <label className="org-switcher">
            <span>Organization</span>
            <form action="/app/switch-organization" method="post">
              <select
                name="organizationId"
                defaultValue={activeMembership?.organizationId ?? ""}
                aria-label="Switch organization"
                onChange={(event) => event.currentTarget.form?.requestSubmit()}
              >
                {organizations.map((membership) => (
                  <option key={membership.id} value={membership.organizationId}>
                    {membership.organizationName} - {membership.role}
                  </option>
                ))}
              </select>
            </form>
          </label>

          <div className="topbar-actions">
            <ThemeToggle />
            <details className="profile-menu">
              <summary aria-label="Open user profile menu">
                <span className="avatar" aria-hidden="true">
                  {session.user.email.slice(0, 1).toUpperCase()}
                </span>
                <span className="profile-copy">
                  <strong>{session.user.email}</strong>
                  <small>{currentRole}</small>
                </span>
              </summary>
              <div className="profile-popover">
                <p>{session.user.email}</p>
                <form action="/auth/logout" method="post">
                  <button type="submit">Sign out</button>
                </form>
              </div>
            </details>
          </div>
        </header>

        <main className="content-shell">{children}</main>
      </div>
    </div>
  );
}
