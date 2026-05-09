import type { FleetOSPermission } from "@fleetos/rbac";

export type AppModuleKey =
  | "dashboard"
  | "control_tower"
  | "jobs"
  | "runs"
  | "fleet"
  | "users"
  | "settings";

export interface AppNavigationItem {
  key: AppModuleKey;
  label: string;
  href: string;
  permission?: FleetOSPermission;
}

export const appNavigationItems: readonly AppNavigationItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/app/dashboard", permission: "organization.read" },
  { key: "control_tower", label: "Control Tower", href: "/app/control-tower", permission: "control_tower.read" },
  { key: "jobs", label: "Jobs", href: "/app/jobs", permission: "jobs.read" },
  { key: "runs", label: "Runs", href: "/app/runs", permission: "runs.read" },
  { key: "fleet", label: "Fleet", href: "/app/fleet", permission: "vehicles.read" },
  { key: "users", label: "Users", href: "/app/users", permission: "users.read" },
  { key: "settings", label: "Settings", href: "/app/settings", permission: "role.read" },
];
