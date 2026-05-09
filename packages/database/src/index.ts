import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface PlatformTenantRow {
  id: string;
  name: string;
  slug: string;
  status: "active" | "suspended" | "archived";
  metadata: Json;
  created_at: string;
  updated_at: string;
}

export interface OrganizationRow {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  metadata: Json;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMembershipRow {
  id: string;
  tenant_id: string;
  organization_id: string;
  user_id: string;
  role_key: string;
  status: "active" | "invited" | "suspended" | "removed";
  created_at: string;
  updated_at: string;
}

export interface RoleRow {
  id: string;
  tenant_id: string | null;
  key: string;
  name: string;
  description: string | null;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface PermissionRow {
  id: string;
  tenant_id: string | null;
  key: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLogInsert {
  tenant_id: string;
  organization_id?: string | null;
  actor_user_id?: string | null;
  action: string;
  entity_table: string;
  entity_id?: string | null;
  metadata?: Json;
  ip_address?: string | null;
  user_agent?: string | null;
}

export type FleetOSDatabase = any;

export type FleetOSSupabaseClient = SupabaseClient<FleetOSDatabase>;

export interface SupabaseClientOptions {
  url: string;
  anonKey: string;
}

export function createFleetOSSupabaseClient(
  options: SupabaseClientOptions,
): FleetOSSupabaseClient {
  return createClient<FleetOSDatabase>(options.url, options.anonKey);
}
