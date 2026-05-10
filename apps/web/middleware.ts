import { isProtectedPath } from "@fleetos/auth";
import { type NextRequest, NextResponse } from "next/server";
import { createMiddlewareSupabaseClient } from "./lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPath = pathname === "/login" || pathname.startsWith("/login/");
  const needsAuthCheck = isProtectedPath(pathname) || isLoginPath;
  const { supabase, response } = createMiddlewareSupabaseClient(request);

  if (!needsAuthCheck) {
    return response;
  }

  let user = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      user = null;
    } else {
      user = data.user;
    }
  } catch {
    user = null;
  }

  if (isProtectedPath(pathname) && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    if (pathname !== "/login") {
      redirectUrl.searchParams.set("message", "Please sign in to continue.");
    }
    return NextResponse.redirect(redirectUrl);
  }

  if (isLoginPath) {
    if (!user) {
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
