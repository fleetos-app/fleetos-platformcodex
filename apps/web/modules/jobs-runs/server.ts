import { getRequiredAuthSession, guardPermission } from "../../lib/auth/server";
import { createServerSupabaseClient } from "../../lib/supabase/server";
import { createOperationalScope } from "./services/jobs-runs-service";
import type { FleetOSPermission } from "@fleetos/rbac";

export async function getJobsRunsServerContext(permission?: FleetOSPermission) {
  const supabase = await createServerSupabaseClient();
  const session = permission
    ? await guardPermission(permission)
    : await getRequiredAuthSession();

  const scope = createOperationalScope({
    tenantId: session.activeMembership?.tenantId,
    organizationId: session.activeMembership?.organizationId,
    actorUserId: session.user.id,
  });

  return { session, supabase, scope };
}
