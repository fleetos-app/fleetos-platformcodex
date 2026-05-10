import { logAuthAuditEvent } from "@fleetos/auth";
import { isFleetOSRole, type FleetOSRole } from "@fleetos/rbac";
import { createOrFindAuthUser } from "../../lib/supabase/auth-admin";
import { createServiceSupabaseClient } from "../../lib/supabase/admin";
import { queryOrganizationMemberships, updateMembershipRole, upsertOrganizationMembership } from "./repository";
import type { OrganizationUser, UserManagementScope } from "./types";

export function createUserManagementScope(input: {
  tenantId?: string;
  organizationId?: string;
  actorUserId: string;
}) {
  if (!input.tenantId || !input.organizationId) {
    throw new Error("Active organization membership is required.");
  }

  return {
    tenantId: input.tenantId,
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
  };
}

export async function listOrganizationUsers(scope: UserManagementScope): Promise<OrganizationUser[]> {
  const serviceSupabase = createServiceSupabaseClient();
  const [memberships, usersResult] = await Promise.all([
    queryOrganizationMemberships(serviceSupabase, scope),
    serviceSupabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  if (usersResult.error) throw usersResult.error;

  const usersById = new Map(usersResult.data.users.map((user) => [user.id, user]));

  return memberships.flatMap((membership: any) => {
    if (!isFleetOSRole(membership.role_key)) {
      return [];
    }

    return {
      membershipId: membership.id,
      userId: membership.user_id,
      email: usersById.get(membership.user_id)?.email ?? membership.user_id,
      role: membership.role_key,
      status: membership.status,
    };
  });
}

export async function createOrInviteOrganizationUser(
  scope: UserManagementScope,
  input: {
    email: string;
    role: FleetOSRole;
    temporaryPassword?: string | null;
  },
) {
  const serviceSupabase = createServiceSupabaseClient();
  const user = await createOrFindAuthUser(serviceSupabase, {
    email: input.email,
    temporaryPassword: input.temporaryPassword,
  });

  const membership = await upsertOrganizationMembership(serviceSupabase, scope, {
    userId: user.id,
    roleKey: input.role,
  });

  await logAuthAuditEvent(serviceSupabase, {
    tenantId: scope.tenantId,
    organizationId: scope.organizationId,
    actorUserId: scope.actorUserId,
    action: "auth.sensitive_access",
    entityTable: "organization_memberships",
    entityId: membership.id,
    metadata: { operation: "organization_user.invite", email: input.email, role: input.role },
  });
}

export async function changeOrganizationUserRole(
  scope: UserManagementScope,
  input: {
    membershipId: string;
    role: FleetOSRole;
  },
) {
  const serviceSupabase = createServiceSupabaseClient();
  const membership = await updateMembershipRole(serviceSupabase, scope, {
    membershipId: input.membershipId,
    roleKey: input.role,
  });

  await logAuthAuditEvent(serviceSupabase, {
    tenantId: scope.tenantId,
    organizationId: scope.organizationId,
    actorUserId: scope.actorUserId,
    action: "auth.sensitive_access",
    entityTable: "organization_memberships",
    entityId: membership.id,
    metadata: { operation: "organization_user.role_change", role: input.role, user_id: membership.user_id },
  });
}
