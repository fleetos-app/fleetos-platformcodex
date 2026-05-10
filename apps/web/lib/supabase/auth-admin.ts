import "server-only";

import type { createServiceSupabaseClient } from "./admin";

type ServiceClient = ReturnType<typeof createServiceSupabaseClient>;

export async function createOrFindAuthUser(
  serviceSupabase: ServiceClient,
  input: {
    email: string;
    temporaryPassword?: string | null;
  },
) {
  const normalizedEmail = input.email.trim().toLowerCase();
  const result = input.temporaryPassword
    ? await serviceSupabase.auth.admin.createUser({
        email: normalizedEmail,
        password: input.temporaryPassword,
        email_confirm: true,
      })
    : await serviceSupabase.auth.admin.inviteUserByEmail(normalizedEmail);

  if (result.data.user) {
    return result.data.user;
  }

  if (result.error && isExistingUserError(result.error.message)) {
    const existingUser = await findAuthUserByEmail(serviceSupabase, normalizedEmail);
    if (existingUser) {
      return existingUser;
    }
  }

  if (result.error) {
    throw result.error;
  }

  throw new Error("Supabase did not return a user.");
}

async function findAuthUserByEmail(serviceSupabase: ServiceClient, email: string) {
  const { data, error } = await serviceSupabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    throw error;
  }

  return data.users.find((user) => user.email?.toLowerCase() === email) ?? null;
}

function isExistingUserError(message?: string) {
  const text = message?.toLowerCase() ?? "";
  return text.includes("already") || text.includes("registered") || text.includes("duplicate");
}
