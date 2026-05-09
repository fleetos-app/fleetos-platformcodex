export type RuntimeEnvironment = "development" | "test" | "production";

export interface FleetOSEnvironment {
  appUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export const defaultAppUrl = "http://localhost:3000";
