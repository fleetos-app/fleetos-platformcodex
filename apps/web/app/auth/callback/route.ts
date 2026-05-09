import { getAuthSession, logSensitiveAccess } from "@fleetos/auth";
import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "../../../lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";
  const supabase = await createServerSupabaseClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
    const session = await getAuthSession(supabase);

    if (session) {
      await logSensitiveAccess(supabase, session, "auth.sessions", undefined, "auth.login");
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin), { status: 303 });
}
