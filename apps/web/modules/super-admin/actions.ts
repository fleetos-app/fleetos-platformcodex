"use server";

import { revalidatePath } from "next/cache";
import {
  createSupportAccessSession,
  updateOrganizationPlan,
  updateOrganizationStatus,
} from "./repository";
import { logSuperAdminAudit, requireSuperAdmin } from "./server";

function requireString(value: FormDataEntryValue | null, label: string) {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(`${label} is required.`);
  return text;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createOrganizationAction(formData: FormData) {
  const { context, serviceSupabase } = await requireSuperAdmin();
  const name = requireString(formData.get("name"), "Organization name");
  const slug = slugify(String(formData.get("slug") || name));
  const planKey = String(formData.get("planKey") || "starter");

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
}

export async function createOrInviteUserAction(formData: FormData) {
  const { context, serviceSupabase } = await requireSuperAdmin();
  const email = requireString(formData.get("email"), "Email").toLowerCase();
  const organizationId = requireString(formData.get("organizationId"), "Organization");
  const roleKey = requireString(formData.get("roleKey"), "Role");
  const temporaryPassword = String(formData.get("temporaryPassword") ?? "");

  const { data: organization, error: organizationError } = await serviceSupabase
    .from("organizations")
    .select("id,tenant_id,name")
    .eq("id", organizationId)
    .single();

  if (organizationError) throw organizationError;

  const createResult = temporaryPassword
    ? await serviceSupabase.auth.admin.createUser({
        email,
        password: temporaryPassword,
        email_confirm: true,
      })
    : await serviceSupabase.auth.admin.inviteUserByEmail(email);

  if (createResult.error) throw createResult.error;
  const user = createResult.data.user;
  if (!user) throw new Error("Supabase did not return an invited user.");

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
}

export async function suspendOrganizationAction(formData: FormData) {
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
}

export async function reactivateOrganizationAction(formData: FormData) {
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
}

export async function updatePlanLimitsAction(formData: FormData) {
  const { context, serviceSupabase } = await requireSuperAdmin();
  const organizationId = requireString(formData.get("organizationId"), "Organization id");
  const planKey = requireString(formData.get("planKey"), "Plan key");
  const billingStatus = requireString(formData.get("billingStatus"), "Billing status");
  const trucks = Number(requireString(formData.get("trucks"), "Truck limit"));
  const users = Number(requireString(formData.get("users"), "User limit"));
  const jobsPerMonth = Number(requireString(formData.get("jobsPerMonth"), "Jobs per month"));
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
}

export async function createSupportAccessAction(formData: FormData) {
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
}
