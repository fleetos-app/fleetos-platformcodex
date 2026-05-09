import { guardPermission } from "../../lib/auth/server";
import { createServerSupabaseClient } from "../../lib/supabase/server";
import { createFleetScope } from "./services/vehicles-service";

export async function getFleetServerContext() {
  const supabase = await createServerSupabaseClient();
  const session = await guardPermission("vehicles.read");
  const scope = createFleetScope({
    tenantId: session.activeMembership?.tenantId,
    organizationId: session.activeMembership?.organizationId,
    actorUserId: session.user.id,
  });

  return { supabase, session, scope };
}
