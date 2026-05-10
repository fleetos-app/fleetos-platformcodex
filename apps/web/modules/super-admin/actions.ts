"use server";

import { isFleetOSRole } from "@fleetos/rbac";
import { revalidatePath } from "next/cache";
import {
  redirectBackWithError,
  redirectWithMessage,
  requireNumber,
  requireString,
} from "../../lib/action-feedback";
import { createOrFindAuthUser } from "../../lib/supabase/auth-admin";
import {
  createSupportAccessSession,
  updateOrganizationPlan,
  updateOrganizationStatus,
} from "./repository";
import { logSuperAdminAudit, requireSuperAdmin } from "./server";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createOrganizationAction(formData: FormData) {
  try {
    const { context, serviceSupabase } = await requireSuperAdmin();
    const name = requireString(formData.get("name"), "Organization name");
    const slug = slugify(String(formData.get("slug") || name));
    if (!slug) throw new Error("Organization slug is required.");
    const planKey = String(formData.get("planKey") || "starter").trim() || "starter";

    const { data: tenant, error: tenantError } = await serviceSupabase
      .from("platform_tenants")
      .insert({ name, slug, status: "active" })
      .select("id")
      .single();

    if (tenantError) throw tenantError;

    const { data: organization, error: organizationError } = await serviceSupabase
      .from("organizations")
      .insert({
        tenant_id: tenant.id,
        name,
        slug,
        status: "active",
        plan_key: planKey,
        billing_status: "trial",
      })
      .select("id,tenant_id,name")
      .single();

    if (organizationError) throw organizationError;

    await logSuperAdminAudit(serviceSupabase, context, {
      action: "super_admin.organization.created",
      entityTable: "organizations",
      entityId: organization.id,
      tenantId: organization.tenant_id,
      organizationId: organization.id,
      metadata: { organization_name: organization.name },
    });

    revalidatePath("/admin/organizations");
  } catch (error) {
    await redirectBackWithError(error, "/admin/organizations");
  }

  redirectWithMessage("/admin/organizations", "Organization created.");
}

export async function createOrInviteUserAction(formData: FormData) {
  try {
    const { context, serviceSupabase } = await requireSuperAdmin();
    const email = requireString(formData.get("email"), "Email").toLowerCase();
    const organizationId = requireString(formData.get("organizationId"), "Organization");
    const roleKey = requireString(formData.get("roleKey"), "Role");
    if (!isFleetOSRole(roleKey)) throw new Error("Invalid role.");
    const temporaryPassword = String(formData.get("temporaryPassword") ?? "").trim();

    const { data: organization, error: organizationError } = await serviceSupabase
      .from("organizations")
      .select("id,tenant_id,name")
      .eq("id", organizationId)
      .single();

    if (organizationError) throw organizationError;

    const user = await createOrFindAuthUser(serviceSupabase, {
      email,
      temporaryPassword: temporaryPassword || null,
    });

    const { error: membershipError } = await serviceSupabase
      .from("organization_memberships")
      .upsert(
        {
          tenant_id: organization.tenant_id,
          organization_id: organization.id,
          user_id: user.id,
          role_key: roleKey,
          status: "active",
        },
        { onConflict: "organization_id,user_id" },
      );

    if (membershipError) throw membershipError;

    await logSuperAdminAudit(serviceSupabase, context, {
      action: "super_admin.user.invited",
      entityTable: "organization_memberships",
      tenantId: organization.tenant_id,
      organizationId: organization.id,
      metadata: { email, role_key: roleKey, organization_name: organization.name },
    });

    revalidatePath("/admin/users");
  } catch (error) {
    await redirectBackWithError(error, "/admin/users");
  }

  redirectWithMessage("/admin/users", "User access saved.");
}

export async function suspendOrganizationAction(formData: FormData) {
  try {
    const { context, serviceSupabase } = await requireSuperAdmin();
    const organizationId = requireString(formData.get("organizationId"), "Organization id");
    const organization = await updateOrganizationStatus(serviceSupabase, organizationId, "suspended");

    await logSuperAdminAudit(serviceSupabase, context, {
      action: "super_admin.organization.suspended",
      entityTable: "organizations",
      entityId: organization.id,
      tenantId: organization.tenant_id,
      organizationId: organization.id,
      metadata: { organization_name: organization.name },
    });

    revalidatePath("/admin/organizations");
  } catch (error) {
    await redirectBackWithError(error, "/admin/organizations");
  }

  redirectWithMessage("/admin/organizations", "Organization suspended.");
}

export async function reactivateOrganizationAction(formData: FormData) {
  try {
    const { context, serviceSupabase } = await requireSuperAdmin();
    const organizationId = requireString(formData.get("organizationId"), "Organization id");
    const organization = await updateOrganizationStatus(serviceSupabase, organizationId, "active");

    await logSuperAdminAudit(serviceSupabase, context, {
      action: "super_admin.organization.reactivated",
      entityTable: "organizations",
      entityId: organization.id,
      tenantId: organization.tenant_id,
      organizationId: organization.id,
      metadata: { organization_name: organization.name },
    });

    revalidatePath("/admin/organizations");
  } catch (error) {
    await redirectBackWithError(error, "/admin/organizations");
  }

  redirectWithMessage("/admin/organizations", "Organization reactivated.");
}

export async function updatePlanLimitsAction(formData: FormData) {
  try {
    const { context, serviceSupabase } = await requireSuperAdmin();
    const organizationId = requireString(formData.get("organizationId"), "Organization id");
    const planKey = requireString(formData.get("planKey"), "Plan key");
    const billingStatus = requireString(formData.get("billingStatus"), "Billing status");
    const trucks = requireNumber(formData.get("trucks"), "Truck limit");
    const users = requireNumber(formData.get("users"), "User limit");
    const jobsPerMonth = requireNumber(formData.get("jobsPerMonth"), "Jobs per month");
    const organization = await updateOrganizationPlan(serviceSupabase, {
      organizationId,
      planKey,
      billingStatus,
      planLimits: { trucks, users, jobs_per_month: jobsPerMonth },
    });

    await logSuperAdminAudit(serviceSupabase, context, {
      action: "super_admin.organization.plan_updated",
      entityTable: "organizations",
      entityId: organization.id,
      tenantId: organization.tenant_id,
      organizationId: organization.id,
      metadata: {
        plan_key: organization.plan_key,
        billing_status: organization.billing_status,
        plan_limits: organization.plan_limits,
      },
    });

    revalidatePath("/admin/billing");
  } catch (error) {
    await redirectBackWithError(error, "/admin/billing");
  }

  redirectWithMessage("/admin/billing", "Plan limits saved.");
}

export async function createSupportAccessAction(formData: FormData) {
  try {
    const { context, serviceSupabase } = await requireSuperAdmin();
    const session = await createSupportAccessSession(serviceSupabase, {
      superAdminUserId: context.userId,
      targetUserId: requireString(formData.get("targetUserId"), "Target user id"),
      organizationId: requireString(formData.get("organizationId"), "Organization id"),
      reason: requireString(formData.get("reason"), "Reason"),
    });

    await logSuperAdminAudit(serviceSupabase, context, {
      action: "super_admin.support_access.created",
      entityTable: "support_access_sessions",
      entityId: session.id,
      organizationId: session.organization_id,
      metadata: { target_user_id: session.target_user_id },
    });

    revalidatePath("/admin/support");
  } catch (error) {
    await redirectBackWithError(error, "/admin/support");
  }

  redirectWithMessage("/admin/support", "Support access recorded.");
}
