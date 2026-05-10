import type { FleetOSSupabaseClient } from "@fleetos/database";
import {
  hasPermission,
  hasRole,
  isFleetOSRole,
  type FleetOSPermission,
  type FleetOSRole,
} from "@fleetos/rbac";
import type {
  AuthAuditAction,
  AuthSession,
  OrganizationMembership,
  SensitiveAccessAuditInput,
} from "./types.js";

export class AuthenticationRequiredError extends Error {
  constructor() {
    super("Authentication required.");
    this.name = "AuthenticationRequiredError";
  }
}

export class OrganizationAccessRequiredError extends Error {
  constructor() {
    super("Organization membership required.");
    this.name = "OrganizationAccessRequiredError";
  }
}

export class PermissionDeniedError extends Error {
  constructor(permission?: FleetOSPermission) {
    super(permission ? `Missing required permission: ${permission}` : "Permission denied.");
    this.name = "PermissionDeniedError";
  }
}

export async function getOrganizationMemberships(
  supabase: FleetOSSupabaseClient,
  userId: string,
): Promise<OrganizationMembership[]> {
  const { data, error } = await supabase
    .from("organization_memberships")
    .select(
      "id, tenant_id, organization_id, user_id, role_key, status, organization:organizations!organization_memberships_tenant_organization_fkey(id, name, slug, status)",
    )
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) {
    throw error;
  }

  return (data ?? []).flatMap((membership) => {
    if (!isFleetOSRole(membership.role_key)) {
      return [];
    }

    const organization = Array.isArray(membership.organization)
      ? membership.organization[0]
      : membership.organization;

    if (!organization || organization.status !== "active") {
      return [];
    }

    return {
      id: membership.id,
      tenantId: membership.tenant_id,
      organizationId: membership.organization_id,
      organizationName: organization.name,
      organizationSlug: organization.slug,
      userId: membership.user_id,
      role: membership.role_key,
      status: membership.status,
    };
  });
}

export function getActiveOrganizationMembership(
  memberships: readonly OrganizationMembership[],
  organizationId?: string,
): OrganizationMembership | undefined {
  if (organizationId) {
    return memberships.find((membership) => membership.organizationId === organizationId);
  }

  return memberships[0];
}

export async function getAuthSession(
  supabase: FleetOSSupabaseClient,
  organizationId?: string,
): Promise<AuthSession | null> {
  let authResponse: Awaited<ReturnType<typeof supabase.auth.getUser>>;
  try {
    authResponse = await supabase.auth.getUser();
  } catch {
    return null;
  }

  const { data, error } = authResponse;

  if (error || !data.user) {
    return null;
  }

  const memberships = await getOrganizationMemberships(supabase, data.user.id);
  const activeMembership = getActiveOrganizationMembership(memberships, organizationId);

  return {
    user: {
      id: data.user.id,
      email: data.user.email ?? "",
      raw: data.user,
    },
    memberships,
    activeMembership,
  };
}

export async function requireAuthSession(
  supabase: FleetOSSupabaseClient,
  organizationId?: string,
): Promise<AuthSession> {
  const session = await getAuthSession(supabase, organizationId);

  if (!session) {
    throw new AuthenticationRequiredError();
  }

  return session;
}

export async function requireRole(
  supabase: FleetOSSupabaseClient,
  allowedRoles: readonly FleetOSRole[],
  organizationId?: string,
): Promise<AuthSession> {
  const session = await requireAuthSession(supabase, organizationId);

  if (!session.activeMembership) {
    throw new OrganizationAccessRequiredError();
  }

  if (!hasRole(session.activeMembership.role, allowedRoles)) {
    throw new PermissionDeniedError();
  }

  return session;
}

export async function requirePermission(
  supabase: FleetOSSupabaseClient,
  permission: FleetOSPermission,
  organizationId?: string,
): Promise<AuthSession> {
  const session = await requireAuthSession(supabase, organizationId);

  if (!session.activeMembership) {
    throw new OrganizationAccessRequiredError();
  }

  if (!hasPermission({ role: session.activeMembership.role }, permission)) {
    throw new PermissionDeniedError(permission);
  }

  return session;
}

export async function logAuthAuditEvent(
  supabase: FleetOSSupabaseClient,
  input: SensitiveAccessAuditInput,
): Promise<void> {
  const { error } = await supabase.from("audit_logs").insert({
    tenant_id: input.tenantId,
    organization_id: input.organizationId ?? null,
    actor_user_id: input.actorUserId,
    action: input.action,
    entity_table: input.entityTable,
    entity_id: input.entityId ?? null,
    metadata: input.metadata ?? {},
  });

  if (error) {
    throw error;
  }
}

export async function logSensitiveAccess(
  supabase: FleetOSSupabaseClient,
  session: AuthSession,
  entityTable: string,
  metadata?: Record<string, unknown>,
  action: AuthAuditAction = "auth.sensitive_access",
): Promise<void> {
  if (!session.activeMembership) {
    return;
  }

  await logAuthAuditEvent(supabase, {
    tenantId: session.activeMembership.tenantId,
    organizationId: session.activeMembership.organizationId,
    actorUserId: session.user.id,
    action,
    entityTable,
    metadata,
  });
}
