export interface PlatformSuperAdminRecord {
  id: string;
  user_id: string;
  email: string;
  status: "active" | "suspended";
}

export interface SuperAdminOrganization {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  status: "active" | "suspended" | "archived";
  plan_key: string;
  billing_status: "trial" | "active" | "past_due" | "paused" | "cancelled";
  plan_limits: Record<string, unknown>;
  created_at: string;
}

export interface SuperAdminContext {
  userId: string;
  email: string;
  superAdminId: string;
}
