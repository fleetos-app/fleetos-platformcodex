"use server";

import { isFleetOSRole } from "@fleetos/rbac";
import { revalidatePath } from "next/cache";
import { redirectBackWithError, redirectWithMessage, requireString } from "../../lib/action-feedback";
import { guardPermission } from "../../lib/auth/server";
import { createOrInviteOrganizationUser, changeOrganizationUserRole, createUserManagementScope } from "./service";

function text(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

async function getWriteScope() {
  const session = await guardPermission("users.write");
  return createUserManagementScope({
    tenantId: session.activeMembership?.tenantId,
    organizationId: session.activeMembership?.organizationId,
    actorUserId: session.user.id,
  });
}

export async function createOrganizationUserAction(formData: FormData) {
  try {
    const scope = await getWriteScope();
    const role = text(formData.get("role"));
    if (!isFleetOSRole(role)) throw new Error("Invalid role.");

    await createOrInviteOrganizationUser(scope, {
      email: requireString(formData.get("email"), "Email").toLowerCase(),
      role,
      temporaryPassword: text(formData.get("temporaryPassword")) || null,
    });

    revalidatePath("/app/users");
  } catch (error) {
    await redirectBackWithError(error, "/app/users");
  }

  redirectWithMessage("/app/users", "User access saved.");
}

export async function changeOrganizationUserRoleAction(formData: FormData) {
  try {
    const scope = await getWriteScope();
    const role = text(formData.get("role"));
    if (!isFleetOSRole(role)) throw new Error("Invalid role.");

    await changeOrganizationUserRole(scope, {
      membershipId: requireString(formData.get("membershipId"), "Membership"),
      role,
    });

    revalidatePath("/app/users");
  } catch (error) {
    await redirectBackWithError(error, "/app/users");
  }

  redirectWithMessage("/app/users", "User role saved.");
}
