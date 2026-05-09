"use server";

import { isFleetOSRole } from "@fleetos/rbac";
import { revalidatePath } from "next/cache";
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
  const scope = await getWriteScope();
  const role = text(formData.get("role"));
  if (!isFleetOSRole(role)) throw new Error("Invalid role.");

  await createOrInviteOrganizationUser(scope, {
    email: text(formData.get("email")).toLowerCase(),
    role,
    temporaryPassword: text(formData.get("temporaryPassword")) || null,
  });

  revalidatePath("/app/users");
}

export async function changeOrganizationUserRoleAction(formData: FormData) {
  const scope = await getWriteScope();
  const role = text(formData.get("role"));
  if (!isFleetOSRole(role)) throw new Error("Invalid role.");

  await changeOrganizationUserRole(scope, {
    membershipId: text(formData.get("membershipId")),
    role,
  });

  revalidatePath("/app/users");
}
