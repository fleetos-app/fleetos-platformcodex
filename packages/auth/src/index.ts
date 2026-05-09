export interface AuthenticatedUser {
  id: string;
  email: string;
}

export interface AuthSession {
  user: AuthenticatedUser;
  tenantId?: string;
}
