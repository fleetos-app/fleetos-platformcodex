import { getAuthSession } from "@fleetos/auth";
import { redirect } from "next/navigation";
import { SubmitButton } from "../../components/submit-button";
import { createServerSupabaseClient } from "../../lib/supabase/server";
import { sendMagicLink, signInWithPassword } from "./actions";

export async function LoginScreen({
  searchParams,
  audience = "staff",
  title = "Sign in to your operations workspace",
  description = "Access is limited to onboarded organization members.",
  defaultNext = "/app/dashboard",
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  audience?: "staff" | "driver" | "subcontractor" | "client";
  title?: string;
  description?: string;
  defaultNext?: string;
}) {
  const params = await searchParams;
  const next = readParam(params.next) ?? defaultNext;
  const safeRedirect = next.startsWith("/") && !next.startsWith("//") ? next : defaultNext;
  const supabase = await createServerSupabaseClient();
  let session = null;

  try {
    session = await getAuthSession(supabase);
  } catch (error) {
    console.error("FleetOS login session check failed", error);
  }

  if (session) {
    redirect(safeRedirect);
  }

  const error = readParam(params.error);
  const message = readParam(params.message);

  return (
    <main className="auth-shell">
      <section className="auth-panel" aria-labelledby="login-title">
        <div>
          <p className="eyebrow">FleetOS {audience}</p>
          <h1 id="login-title">{title}</h1>
          <p className="summary">{description}</p>
        </div>

        <nav className="login-audience-nav" aria-label="Login type">
          <a href="/login/staff">Staff</a>
          <a href="/login/driver">Driver</a>
          <a href="/login/subcontractor">Subcontractor</a>
          <a href="/login/client">Client</a>
        </nav>

        {error ? <p className="auth-alert error" role="alert">{error}</p> : null}
        {message ? <p className="auth-alert success">{message}</p> : null}

        <form className="auth-form" action={signInWithPassword}>
          <input type="hidden" name="next" value={safeRedirect} />
          <label>
            <span>Email</span>
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            <span>Password</span>
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          <SubmitButton pendingLabel="Signing in...">Sign in</SubmitButton>
        </form>

        <form className="auth-link-form" action={sendMagicLink}>
          <input type="hidden" name="next" value={safeRedirect} />
          <label>
            <span>Magic link</span>
            <input name="email" type="email" autoComplete="email" placeholder="you@example.com" />
          </label>
          <SubmitButton pendingLabel="Sending...">Email magic link</SubmitButton>
        </form>
      </section>
    </main>
  );
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
