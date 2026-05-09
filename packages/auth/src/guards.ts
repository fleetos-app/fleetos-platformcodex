import type { FleetOSPermission, FleetOSRole } from "@fleetos/rbac";

export interface RouteGuardRule {
  pathPrefix: string;
  roles?: readonly FleetOSRole[];
  permissions?: readonly FleetOSPermission[];
  auditSensitiveAccess?: boolean;
}

export const protectedRouteRules: readonly RouteGuardRule[] = [
  { pathPrefix: "/app" },
  { pathPrefix: "/admin" },
];

export function findRouteGuardRule(
  pathname: string,
  rules: readonly RouteGuardRule[] = protectedRouteRules,
): RouteGuardRule | undefined {
  return rules.find((rule) => pathname.startsWith(rule.pathPrefix));
}

export function isProtectedPath(pathname: string): boolean {
  return Boolean(findRouteGuardRule(pathname));
}
