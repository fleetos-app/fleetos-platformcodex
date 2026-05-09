"use client";

import type { FleetOSSupabaseClient } from "@fleetos/database";
import { isFleetOSRole } from "@fleetos/rbac";
import type { Session } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

export interface AuthProviderValue {
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthProviderValue | undefined>(undefined);

export interface AuthProviderProps extends PropsWithChildren {
  supabase: FleetOSSupabaseClient;
  initialSession?: Session | null;
  auditAuthEvents?: boolean;
}

export function AuthProvider({
  children,
  supabase,
  initialSession = null,
  auditAuthEvents = true,
}: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(initialSession);
  const [isLoading, setIsLoading] = useState(!initialSession);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session);
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);

      if (auditAuthEvents && _event === "SIGNED_IN" && nextSession) {
        void logClientAuthEvent(supabase, nextSession, "auth.login");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const value = useMemo<AuthProviderValue>(
    () => ({
      session,
      isLoading,
      signOut: async () => {
        if (auditAuthEvents && session) {
          await logClientAuthEvent(supabase, session, "auth.logout");
        }

        await supabase.auth.signOut();
      },
    }),
    [auditAuthEvents, isLoading, session, supabase],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

async function logClientAuthEvent(
  supabase: FleetOSSupabaseClient,
  session: Session,
  action: "auth.login" | "auth.logout",
) {
  const { data } = await supabase
    .from("organization_memberships")
    .select("tenant_id, organization_id, role_key")
    .eq("user_id", session.user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (!data || !isFleetOSRole(data.role_key)) {
    return;
  }

  await supabase.from("audit_logs").insert({
    tenant_id: data.tenant_id,
    organization_id: data.organization_id,
    actor_user_id: session.user.id,
    action,
    entity_table: "auth.sessions",
    metadata: { role: data.role_key },
  });
}

export function useAuthSession(): AuthProviderValue {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuthSession must be used within AuthProvider.");
  }

  return value;
}
