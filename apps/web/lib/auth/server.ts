import {
  AuthenticationRequiredError,
  logSensitiveAccess,
  OrganizationAccessRequiredError,
  PermissionDeniedError,
  requireAuthSession,
  requirePermission,
  requireRole,
} from "@fleetos/auth";
import type { FleetOSPermission, FleetOSRole } from "@fleetos/rbac";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../supabase/server";

export const selectedOrganizationCookie = "fleetos_selected_organization_id";

export async function getSelectedOrganizationId() {
  const cookieStore = await cookies();
  return cookieStore.get(selectedOrganizationCookie)?.value;
}

async function loginRedirectPath() {
  const headerStore = await headers();
  const next = headerStore.get("x-fleetos-pathname") ?? "/app/dashboard";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/app/dashboard";
  return `/login?next=${encodeURIComponent(safeNext)}`;
}

export async function getRequiredAuthSession(organizationId?: string) {
  const supabase = await createServerSupabaseClient();
  const selectedOrganizationId = organizationId ?? (await getSelectedOrganizationId());

  try {
    return await requireAuthSession(supabase, selectedOrganizationId);
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      redirect(await loginRedirectPath());
    }

    throw error;
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
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      redirect(await loginRedirectPath());
    }

    if (
      error instanceof OrganizationAccessRequiredError ||
      error instanceof PermissionDeniedError
    ) {
      redirect("/unauthorized");
    }

    throw error;
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
    try {
      await logSensitiveAccess(supabase, session, "route.guard", { permission });
    } catch (auditError) {
      console.error("FleetOS route guard audit failed", auditError);
    }
    return session;
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      redirect(await loginRedirectPath());
    }

    if (
      error instanceof OrganizationAccessRequiredError ||
      error instanceof PermissionDeniedError
    ) {
      redirect("/unauthorized");
    }

    throw error;
  }
}
