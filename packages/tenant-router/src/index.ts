export interface TenantRouteContext {
  host: string;
  pathname: string;
}

export interface TenantRouteResult {
  tenantSlug?: string;
}
