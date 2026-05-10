import { cookies, headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getRequiredAuthSession, selectedOrganizationCookie } from "../../../../lib/auth/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const organizationId = String(formData.get("organizationId") ?? "");
  const session = await getRequiredAuthSession();

  if (!session.memberships.some((membership) => membership.organizationId === organizationId)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url), { status: 303 });
  }

  const cookieStore = await cookies();
  cookieStore.set(selectedOrganizationCookie, organizationId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  const headerStore = await headers();
  const referer = safeLocalRedirect(headerStore.get("referer"), request.url);
  return NextResponse.redirect(referer, { status: 303 });
}

function safeLocalRedirect(referer: string | null, requestUrl: string) {
  const fallback = new URL("/app/dashboard", requestUrl);

  if (!referer) {
    return fallback;
  }

  try {
    const target = new URL(referer);
    const current = new URL(requestUrl);
    if (target.origin !== current.origin) {
      return fallback;
    }
    return target;
  } catch {
    return referer.startsWith("/") && !referer.startsWith("//")
      ? new URL(referer, requestUrl)
      : fallback;
  }
}
