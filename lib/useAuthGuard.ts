"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type AuthState =
  | { status: "loading" }
  | { status: "authenticated"; user: any }
  | { status: "unauthenticated" };

async function clearStaleAuth() {
  try { await createClient().auth.signOut(); } catch {}
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith("sb-") || k.includes("supabase"))
      .forEach(k => localStorage.removeItem(k));
  } catch {}
  try {
    document.cookie.split(";").forEach(c => {
      const name = c.split("=")[0].trim();
      if (name.startsWith("sb-") || name.includes("supabase") || name.includes("auth-token")) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
      }
    });
  } catch {}
}

export function useAuthGuard(): AuthState {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    const validate = async () => {
      try {
        const { data: { session }, error: sessionErr } = await supabase.auth.getSession();

        if (sessionErr || !session) {
          await clearStaleAuth();
          if (!cancelled) router.replace("/auth");
          return;
        }

        // Token expired — try silent refresh first
        const isExpired = session.expires_at
          ? session.expires_at * 1000 < Date.now()
          : false;

        if (isExpired) {
          const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession();
          if (refreshErr || !refreshed.session) {
            await clearStaleAuth();
            if (!cancelled) router.replace("/auth?reason=session_expired");
            return;
          }
          if (!cancelled) setState({ status: "authenticated", user: refreshed.session.user });
          return;
        }

        // Verify token is actually accepted by Supabase server
        const { data: { user }, error: userErr } = await supabase.auth.getUser();
        if (userErr || !user) {
          await clearStaleAuth();
          // Show "please re-login" message via query param
          if (!cancelled) router.replace("/auth?reason=token_invalid");
          return;
        }

        if (!cancelled) setState({ status: "authenticated", user });
      } catch {
        await clearStaleAuth();
        if (!cancelled) router.replace("/auth?reason=unknown");
      }
    };

    validate();
    return () => { cancelled = true; };
  }, []);

  return state;
}
