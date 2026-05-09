import type { FleetOSRole } from "@fleetos/rbac";
import type { Session, User } from "@supabase/supabase-js";

export interface AuthenticatedUser {
  id: string;
  email: string;
  raw: User;
}

export interface OrganizationMembership {
  id: string;
  tenantId: string;
  organizationId: string;
  userId: string;
  role: FleetOSRole;
  status: "active" | "invited" | "suspended" | "removed";
}

export interface AuthSession {
  user: AuthenticatedUser;
  session: Session;
  memberships: OrganizationMembership[];
  activeMembership?: OrganizationMembership;
}

export type AuthAuditAction =
  | "auth.login"
  | "auth.logout"
  | "auth.session.checked"
  | "auth.sensitive_access";

export interface SensitiveAccessAuditInput {
  tenantId: string;
  organizationId?: string;
  actorUserId: string;
  action: AuthAuditAction;
  entityTable: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}
