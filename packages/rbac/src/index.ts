export const fleetOSRoles = [
  "owner",
  "admin",
  "ops_manager",
  "accounts",
  "driver",
  "subcontractor",
  "client",
  "mechanic",
] as const;

export type FleetOSRole = (typeof fleetOSRoles)[number];

export const fleetOSPermissions = [
  "tenant.read",
  "organization.read",
  "membership.read",
  "role.read",
  "permission.read",
  "audit_log.read",
  "audit_log.create",
  "sensitive_access.read",
] as const;

export type FleetOSPermission = (typeof fleetOSPermissions)[number];

export interface PermissionCheck {
  role: FleetOSRole;
  permission: FleetOSPermission;
}

export interface AccessContext {
  role: FleetOSRole;
  permissions?: readonly string[];
}

export const rolePermissions: Record<FleetOSRole, readonly FleetOSPermission[]> = {
  owner: fleetOSPermissions,
  admin: fleetOSPermissions,
  ops_manager: [
    "tenant.read",
    "organization.read",
    "membership.read",
    "role.read",
    "permission.read",
    "audit_log.create",
    "sensitive_access.read",
  ],
  accounts: [
    "tenant.read",
    "organization.read",
    "membership.read",
    "audit_log.create",
  ],
  driver: ["tenant.read", "organization.read", "audit_log.create"],
  subcontractor: ["tenant.read", "organization.read", "audit_log.create"],
  client: ["tenant.read", "organization.read"],
  mechanic: ["tenant.read", "organization.read", "audit_log.create"],
};

export function isFleetOSRole(value: string): value is FleetOSRole {
  return fleetOSRoles.includes(value as FleetOSRole);
}

export function hasRole(
  currentRole: FleetOSRole,
  allowedRoles: readonly FleetOSRole[],
): boolean {
  return allowedRoles.includes(currentRole);
}

export function hasPermission(
  context: AccessContext,
  permission: FleetOSPermission,
): boolean {
  if (context.permissions?.includes(permission)) {
    return true;
  }

  return rolePermissions[context.role].includes(permission);
}

export function assertPermission(
  context: AccessContext,
  permission: FleetOSPermission,
): void {
  if (!hasPermission(context, permission)) {
    throw new Error(`Missing required permission: ${permission}`);
  }
}
