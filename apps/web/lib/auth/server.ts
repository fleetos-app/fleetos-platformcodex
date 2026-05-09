import {
  logSensitiveAccess,
  requireAuthSession,
  requirePermission,
  requireRole,
} from "@fleetos/auth";
import type { FleetOSPermission, FleetOSRole } from "@fleetos/rbac";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../supabase/server";

export const selectedOrganizationCookie = "fleetos_selected_organization_id";

export async function getSelectedOrganizationId() {
  const cookieStore = await cookies();
  return cookieStore.get(selectedOrganizationCookie)?.value;
}

export async function getRequiredAuthSession(organizationId?: string) {
  const supabase = await createServerSupabaseClient();
  const selectedOrganizationId = organizationId ?? (await getSelectedOrganizationId());

  try {
    return await requireAuthSession(supabase, selectedOrganizationId);
  } catch {
    redirect("/login");
  }
}

export async function guardRole(
  allowedRoles: readonly FleetOSRole[],
  organizationId?: string,
) {
  const supabase = await createServerSupabaseClient();
  const selectedOrganizationId = organizationId ?? (await getSelectedOrganizationId());

  try {
    return await requireRole(supabase, allowedRoles, selectedOrganizationId);
  } catch {
    redirect("/unauthorized");
  }
}

export async function guardPermission(
  permission: FleetOSPermission,
  organizationId?: string,
) {
  const supabase = await createServerSupabaseClient();
  const selectedOrganizationId = organizationId ?? (await getSelectedOrganizationId());

  try {
    const session = await requirePermission(supabase, permission, selectedOrganizationId);
    await logSensitiveAccess(supabase, session, "route.guard", { permission });
    return session;
  } catch {
    redirect("/unauthorized");
  }
}
