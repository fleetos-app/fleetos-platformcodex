import type { FleetOSRole } from "@fleetos/rbac";

export interface UserManagementScope {
  tenantId: string;
  organizationId: string;
  actorUserId: string;
}

export interface OrganizationUser {
  membershipId: string;
  userId: string;
  email: string;
  role: FleetOSRole;
  status: "active" | "invited" | "suspended" | "removed";
}
