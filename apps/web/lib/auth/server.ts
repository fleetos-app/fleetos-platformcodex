import {
  logSensitiveAccess,
  requireAuthSession,
  requirePermission,
  requireRole,
} from "@fleetos/auth";
import type { FleetOSPermission, FleetOSRole } from "@fleetos/rbac";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../supabase/server";

export async function getRequiredAuthSession(organizationId?: string) {
  const supabase = await createServerSupabaseClient();

  try {
    return await requireAuthSession(supabase, organizationId);
  } catch {
    redirect("/login");
  }
}

export async function guardRole(
  allowedRoles: readonly FleetOSRole[],
  organizationId?: string,
) {
  const supabase = await createServerSupabaseClient();

  try {
    return await requireRole(supabase, allowedRoles, organizationId);
  } catch {
    redirect("/unauthorized");
  }
}

export async function guardPermission(
  permission: FleetOSPermission,
  organizationId?: string,
) {
  const supabase = await createServerSupabaseClient();

  try {
    const session = await requirePermission(supabase, permission, organizationId);
    await logSensitiveAccess(supabase, session, "route.guard", { permission });
    return session;
  } catch {
    redirect("/unauthorized");
  }
}
