import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type FleetOSDatabase = Record<string, never>;

export interface SupabaseClientOptions {
  url: string;
  anonKey: string;
}

export function createFleetOSSupabaseClient(
  options: SupabaseClientOptions,
): SupabaseClient<FleetOSDatabase> {
  return createClient<FleetOSDatabase>(options.url, options.anonKey);
}
