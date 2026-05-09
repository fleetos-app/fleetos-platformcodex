import { getAuthSession, logSensitiveAccess } from "@fleetos/auth";
import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "../../../lib/supabase/server";

function safeNext(value: string | null) {
  const next = value && value.startsWith("/") && !value.startsWith("//") ? value : "/app/dashboard";
  return next;
}

function loginRedirect(requestUrl: URL, message: string, next: string) {
  const url = new URL("/login", requestUrl.origin);
  url.searchParams.set("error", message);
  url.searchParams.set("next", next);
  return NextResponse.redirect(url, { status: 303 });
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeNext(requestUrl.searchParams.get("next"));
  const supabase = await createServerSupabaseClient();

  if (!code) {
    return loginRedirect(requestUrl, "The sign-in link is missing a verification code.", next);
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return loginRedirect(requestUrl, "The sign-in link is invalid or has expired.", next);
    }

    try {
      const session = await getAuthSession(supabase);
      if (session) {
        await logSensitiveAccess(supabase, session, "auth.sessions", undefined, "auth.login");
      }
    } catch (error) {
      console.error("FleetOS magic link audit failed", error);
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin), { status: 303 });
}
