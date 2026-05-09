import { getRequiredAuthSession } from "../../lib/auth/server";
import { createServerSupabaseClient } from "../../lib/supabase/server";
import { createOperationalScope } from "./services/jobs-runs-service";

export async function getJobsRunsServerContext() {
  const [session, supabase] = await Promise.all([
    getRequiredAuthSession(),
    createServerSupabaseClient(),
  ]);

  const scope = createOperationalScope({
    tenantId: session.activeMembership?.tenantId,
    organizationId: session.activeMembership?.organizationId,
    actorUserId: session.user.id,
  });

  return { session, supabase, scope };
}
