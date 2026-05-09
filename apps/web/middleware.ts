import { isProtectedPath } from "@fleetos/auth";
import { type NextRequest, NextResponse } from "next/server";
import { createMiddlewareSupabaseClient } from "./lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { supabase, response } = createMiddlewareSupabaseClient(request);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (isProtectedPath(pathname) && !session) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
