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

function friendlyAuthError(message?: string) {
  const text = message?.toLowerCase() ?? "";

  if (text.includes("invalid login") || text.includes("invalid credentials")) {
    return "The email or password is not correct.";
  }

  if (text.includes("email not confirmed")) {
    return "Please confirm your email before signing in.";
  }

  if (text.includes("rate limit") || text.includes("too many")) {
    return "Too many attempts. Please wait a moment and try again.";
  }

  return "We could not sign you in. Please try again.";
}

async function auditLogin(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>, method: string) {
  try {
    const session = await getAuthSession(supabase);
    if (session) {
      await logSensitiveAccess(supabase, session, "auth.sessions", { method }, "auth.login");
    }
  } catch (error) {
    console.error("FleetOS login audit failed", error);
  }
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
    redirectWithError(friendlyAuthError(error.message), next);
  }

  await auditLogin(supabase, "password");

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
    redirectWithError(friendlyAuthError(error.message), next);
  }

  redirect(`/login?message=${encodeURIComponent("Magic link sent. Check your email.")}&next=${encodeURIComponent(next)}`);
}
