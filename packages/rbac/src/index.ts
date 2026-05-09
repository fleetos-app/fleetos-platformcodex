export type FleetOSRole = "owner" | "admin" | "member";

export interface PermissionCheck {
  role: FleetOSRole;
  action: string;
  resource: string;
}
