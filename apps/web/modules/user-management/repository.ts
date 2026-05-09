import type { createServiceSupabaseClient } from "../../lib/supabase/admin";
import type { UserManagementScope } from "./types";

type ServiceClient = ReturnType<typeof createServiceSupabaseClient>;

export async function queryOrganizationMemberships(
  serviceSupabase: ServiceClient,
  scope: UserManagementScope,
) {
  const { data, error } = await serviceSupabase
    .from("organization_memberships")
    .select("id,user_id,role_key,status")
    .eq("tenant_id", scope.tenantId)
    .eq("organization_id", scope.organizationId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function upsertOrganizationMembership(
  serviceSupabase: ServiceClient,
  scope: UserManagementScope,
  input: {
    userId: string;
    roleKey: string;
  },
) {
  const { data, error } = await serviceSupabase
    .from("organization_memberships")
    .upsert(
      {
        tenant_id: scope.tenantId,
        organization_id: scope.organizationId,
        user_id: input.userId,
        role_key: input.roleKey,
        status: "active",
      },
      { onConflict: "organization_id,user_id" },
    )
    .select("id")
    .single();

  if (error) throw error;
  return data;
}

export async function updateMembershipRole(
  serviceSupabase: ServiceClient,
  scope: UserManagementScope,
  input: {
    membershipId: string;
    roleKey: string;
  },
) {
  const { data, error } = await serviceSupabase
    .from("organization_memberships")
    .update({ role_key: input.roleKey })
    .eq("tenant_id", scope.tenantId)
    .eq("organization_id", scope.organizationId)
    .eq("id", input.membershipId)
    .select("id,user_id,role_key")
    .single();

  if (error) throw error;
  return data;
}
