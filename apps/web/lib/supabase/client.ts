"use client";

import type { FleetOSDatabase } from "@fleetos/database";
import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseBrowserEnv } from "../env";

export function createBrowserSupabaseClient() {
  const { url, anonKey } = getSupabaseBrowserEnv();
  return createBrowserClient<FleetOSDatabase>(url, anonKey);
}
