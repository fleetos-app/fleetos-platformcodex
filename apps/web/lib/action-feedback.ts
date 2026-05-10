import { headers } from "next/headers";
import { redirect } from "next/navigation";

export function optionalString(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

export function requireString(value: FormDataEntryValue | null, label: string) {
  const text = optionalString(value);
  if (!text) {
    throw new Error(`${label} is required.`);
  }
  return text;
}

export function optionalNumber(value: FormDataEntryValue | null) {
  const text = optionalString(value);
  if (text == null) {
    return null;
  }

  const valueAsNumber = Number(text);
  if (!Number.isFinite(valueAsNumber)) {
    throw new Error("Enter a valid number.");
  }

  return valueAsNumber;
}

export function requireNumber(value: FormDataEntryValue | null, label: string) {
  const valueAsNumber = optionalNumber(value);
  if (valueAsNumber == null) {
    throw new Error(`${label} is required.`);
  }
  return valueAsNumber;
}

export function friendlyActionError(error: unknown) {
  const maybeError = error as { code?: string; message?: string; details?: string };
  const code = maybeError?.code;
  const text = `${maybeError?.message ?? ""} ${maybeError?.details ?? ""}`.toLowerCase();

  if (code === "23505" || text.includes("duplicate key")) {
    if (text.includes("vehicles") || text.includes("registration_number")) {
      return "A vehicle with that registration already exists.";
    }

    if (text.includes("runs") || text.includes("run_number")) {
      return "A run with that run number already exists.";
    }

    if (text.includes("organization") || text.includes("platform_tenants")) {
      return "An organization with that slug already exists.";
    }

    if (text.includes("auth") || text.includes("email")) {
      return "A user with that email already exists.";
    }

    return "That record already exists.";
  }

  if (code === "23503" || text.includes("foreign key")) {
    return "One of the selected records no longer exists. Refresh the page and try again.";
  }

  if (code === "22P02" || text.includes("invalid input syntax for type uuid")) {
    return "One of the selected IDs is invalid. Refresh the page and choose a listed option.";
  }

  if (code === "42501" || text.includes("row-level security") || text.includes("permission denied")) {
    return "You do not have permission to save that change.";
  }

  if (text.includes("email rate limit") || text.includes("too many")) {
    return "Too many attempts. Please wait a moment and try again.";
  }

  if (text.includes("already been registered") || text.includes("already registered")) {
    return "A user with that email already exists.";
  }

  if (error instanceof Error && error.message && !text.includes("supabase")) {
    return error.message;
  }

  return "We could not save that change. Refresh the page and try again.";
}

export async function redirectBackWithError(error: unknown, fallbackPath: string): Promise<never> {
  const path = await currentPathFromReferer(fallbackPath);
  redirect(withFeedback(path, "error", friendlyActionError(error)));
}

export function redirectWithMessage(path: string, message: string): never {
  redirect(withFeedback(path, "message", message));
}

async function currentPathFromReferer(fallbackPath: string) {
  const headerStore = await headers();
  const referer = headerStore.get("referer");

  if (!referer) {
    return fallbackPath;
  }

  try {
    const url = new URL(referer);
    return `${url.pathname}${url.search}`;
  } catch {
    return referer.startsWith("/") && !referer.startsWith("//") ? referer : fallbackPath;
  }
}

function withFeedback(path: string, key: "error" | "message", value: string) {
  const [pathname, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  params.delete("error");
  params.delete("message");
  params.set(key, value);
  const queryString = params.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}
