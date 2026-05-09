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
  const referer = headerStore.get("referer") ?? "/app/dashboard";
  return NextResponse.redirect(referer, { status: 303 });
}
