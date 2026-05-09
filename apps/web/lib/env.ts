export function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getSupabaseBrowserEnv() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "local-development-anon-key",
  };
}

export function getSupabaseServiceEnv() {
  return {
    url: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    serviceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  };
}
