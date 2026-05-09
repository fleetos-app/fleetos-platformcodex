import type { FleetOSPermission } from "@fleetos/rbac";

export type AppModuleKey =
  | "dashboard"
  | "fleet"
  | "drivers"
  | "subcontractors"
  | "jobs"
  | "pods"
  | "invoices"
  | "compliance"
  | "reports"
  | "settings";

export interface AppNavigationItem {
  key: AppModuleKey;
  label: string;
  href: string;
  permission?: FleetOSPermission;
}

export const appNavigationItems: readonly AppNavigationItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/app/dashboard", permission: "organization.read" },
  { key: "fleet", label: "Fleet", href: "/app/fleet", permission: "organization.read" },
  { key: "drivers", label: "Drivers", href: "/app/drivers", permission: "organization.read" },
  { key: "subcontractors", label: "Subcontractors", href: "/app/subcontractors", permission: "organization.read" },
  { key: "jobs", label: "Jobs", href: "/app/jobs", permission: "organization.read" },
  { key: "pods", label: "PODs", href: "/app/pods", permission: "organization.read" },
  { key: "invoices", label: "Invoices", href: "/app/invoices", permission: "organization.read" },
  { key: "compliance", label: "Compliance", href: "/app/compliance", permission: "organization.read" },
  { key: "reports", label: "Reports", href: "/app/reports", permission: "organization.read" },
  { key: "settings", label: "Settings", href: "/app/settings", permission: "role.read" },
];
