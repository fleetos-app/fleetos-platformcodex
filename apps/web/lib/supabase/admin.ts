import "server-only";

import type { FleetOSDatabase } from "@fleetos/database";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseServiceEnv } from "../env";

export function createServiceSupabaseClient() {
  const { url, serviceRoleKey } = getSupabaseServiceEnv();

  return createClient<FleetOSDatabase>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
