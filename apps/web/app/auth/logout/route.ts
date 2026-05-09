import { getAuthSession, logSensitiveAccess } from "@fleetos/auth";
import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "../../../lib/supabase/server";

export async function POST(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const supabase = await createServerSupabaseClient();
  const session = await getAuthSession(supabase);

  if (session) {
    await logSensitiveAccess(supabase, session, "auth.sessions", undefined, "auth.logout");
  }

  await supabase.auth.signOut();

  return NextResponse.redirect(new URL("/login", requestUrl.origin), { status: 303 });
}
