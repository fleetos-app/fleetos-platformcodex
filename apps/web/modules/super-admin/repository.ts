import type { createServiceSupabaseClient } from "../../lib/supabase/admin";

type ServiceClient = ReturnType<typeof createServiceSupabaseClient>;

export async function listOrganizations(serviceSupabase: ServiceClient) {
  const { data, error } = await serviceSupabase
    .from("organizations")
    .select("id,tenant_id,name,slug,status,plan_key,billing_status,plan_limits,created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function updateOrganizationStatus(
  serviceSupabase: ServiceClient,
  organizationId: string,
  status: "active" | "suspended",
) {
  const { data, error } = await serviceSupabase
    .from("organizations")
    .update({ status })
    .eq("id", organizationId)
    .select("id,tenant_id,name,status")
    .single();

  if (error) throw error;
  return data;
}

export async function updateOrganizationPlan(
  serviceSupabase: ServiceClient,
  input: {
    organizationId: string;
    planKey: string;
    billingStatus: string;
    planLimits: Record<string, unknown>;
  },
) {
  const { data, error } = await serviceSupabase
    .from("organizations")
    .update({
      plan_key: input.planKey,
      billing_status: input.billingStatus,
      plan_limits: input.planLimits,
    })
    .eq("id", input.organizationId)
    .select("id,tenant_id,name,plan_key,billing_status,plan_limits")
    .single();

  if (error) throw error;
  return data;
}

export async function listTenantInfrastructure(serviceSupabase: ServiceClient) {
  const { data, error } = await serviceSupabase
    .from("tenant_infrastructure")
    .select("id,tenant_id,region,supabase_project_ref,status,created_at,updated_at")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function listOrganizationMemberships(serviceSupabase: ServiceClient) {
  const { data, error } = await serviceSupabase
    .from("organization_memberships")
    .select(
      "id,tenant_id,organization_id,user_id,role_key,status,organization:organizations!organization_memberships_tenant_organization_fkey(name)",
    )
    .order("created_at", { ascending: false })
    .limit(250);

  if (error) throw error;
  return data ?? [];
}

export async function createSupportAccessSession(
  serviceSupabase: ServiceClient,
  input: {
    superAdminUserId: string;
    targetUserId: string;
    organizationId: string;
    reason: string;
  },
) {
  const { data, error } = await serviceSupabase
    .from("support_access_sessions")
    .insert({
      super_admin_user_id: input.superAdminUserId,
      target_user_id: input.targetUserId,
      organization_id: input.organizationId,
      reason: input.reason,
    })
    .select("id,organization_id,target_user_id")
    .single();

  if (error) throw error;
  return data;
}
