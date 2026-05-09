"use server";

import { getAuthSession, logSensitiveAccess } from "@fleetos/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../../lib/supabase/server";

function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" && value.startsWith("/") ? value : "/app/dashboard";
  return next.startsWith("//") ? "/app/dashboard" : next;
}

function redirectWithError(message: string, next: string): never {
  redirect(`/login?error=${encodeURIComponent(message)}&next=${encodeURIComponent(next)}`);
}

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!email || !password) {
    redirectWithError("Email and password are required.", next);
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirectWithError(error.message, next);
  }

  const session = await getAuthSession(supabase);
  if (session) {
    await logSensitiveAccess(supabase, session, "auth.sessions", { method: "password" }, "auth.login");
  }

  redirect(next);
}

export async function sendMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const next = safeNext(formData.get("next"));

  if (!email) {
    redirectWithError("Email is required for magic link sign in.", next);
  }

  const headerStore = await headers();
  const origin = headerStore.get("origin") ?? process.env.FLEETOS_APP_URL ?? "http://localhost:3000";
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    redirectWithError(error.message, next);
  }

  redirect(`/login?message=${encodeURIComponent("Magic link sent. Check your email.")}&next=${encodeURIComponent(next)}`);
}
