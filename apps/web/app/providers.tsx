"use client";

import { AuthProvider } from "@fleetos/auth";
import { useMemo, type PropsWithChildren } from "react";
import { createBrowserSupabaseClient } from "../lib/supabase/client";

export function Providers({ children }: PropsWithChildren) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  return <AuthProvider supabase={supabase}>{children}</AuthProvider>;
}
