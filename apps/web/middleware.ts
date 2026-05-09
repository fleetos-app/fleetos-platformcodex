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
    redirectUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname === "/login" || pathname.startsWith("/login/")) {
    if (!session) {
      return response;
    }

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/app/dashboard";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
