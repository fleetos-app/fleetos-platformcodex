import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../../lib/supabase/server";
import { createServiceSupabaseClient } from "../../lib/supabase/admin";
import { isActiveSuperAdminRecord } from "./access";
import type { SuperAdminContext } from "./types";

export async function requireSuperAdmin(): Promise<{
  context: SuperAdminContext;
  serviceSupabase: ReturnType<typeof createServiceSupabaseClient>;
}> {
  const userSupabase = await createServerSupabaseClient();
  let user = null;
  try {
    const { data, error } = await userSupabase.auth.getUser();
    user = error ? null : data.user;
  } catch {
    user = null;
  }

  if (!user) {
    redirect("/login?next=/admin/dashboard");
  }

  const serviceSupabase = createServiceSupabaseClient();
  const { data, error } = await serviceSupabase
    .from("platform_super_admins")
    .select("id,user_id,email,status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data || !isActiveSuperAdminRecord(data)) {
    redirect("/admin/forbidden");
  }

  return {
    serviceSupabase,
    context: {
      userId: user.id,
      email: user.email ?? data.email,
      superAdminId: data.id,
    },
  };
}

export async function logSuperAdminAudit(
  serviceSupabase: ReturnType<typeof createServiceSupabaseClient>,
  context: SuperAdminContext,
  input: {
    action: string;
    entityTable: string;
    entityId?: string | null;
    tenantId?: string | null;
    organizationId?: string | null;
    metadata?: Record<string, unknown>;
  },
) {
  const { error } = await serviceSupabase.from("audit_logs").insert({
    tenant_id: input.tenantId ?? null,
    organization_id: input.organizationId ?? null,
    actor_user_id: context.userId,
    action: input.action,
    entity_table: input.entityTable,
    entity_id: input.entityId ?? null,
    metadata: {
      super_admin: true,
      super_admin_email: context.email,
      ...(input.metadata ?? {}),
    },
  });

  if (error) {
    throw error;
  }
}
