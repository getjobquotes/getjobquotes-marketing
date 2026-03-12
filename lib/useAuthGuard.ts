"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AuthState =
  | { status: "loading" }
  | { status: "authenticated"; user: any }
  | { status: "unauthenticated" };

async function clearStaleAuth() {
  const supabase = createClient();

  // 1. Sign out from Supabase
  try { await supabase.auth.signOut(); } catch {}

  // 2. Remove all Supabase keys from localStorage
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith("sb-") || k.includes("supabase"))
      .forEach(k => localStorage.removeItem(k));
  } catch {}

  // 3. Expire all auth-related cookies
  try {
    document.cookie.split(";").forEach(c => {
      const name = c.split("=")[0].trim();
      if (name.startsWith("sb-") || name.includes("supabase") || name.includes("auth-token")) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
      }
    });
  } catch {}
}

export function useAuthGuard(): AuthState {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    const validate = async () => {
      const supabase = createClient();

      try {
        // Step 1 — get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        // Step 2 — no session or session error → clear and redirect
        if (sessionError || !session) {
          await clearStaleAuth();
          if (!cancelled) router.replace("/auth");
          return;
        }

        // Step 3 — session exists but token is expired
        const isExpired = session.expires_at
          ? session.expires_at * 1000 < Date.now()
          : false;

        if (isExpired) {
          // Try refresh first
          const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError || !refreshed.session) {
            await clearStaleAuth();
            if (!cancelled) router.replace("/auth");
            return;
          }
          // Refresh worked — use refreshed user
          if (!cancelled) setState({ status: "authenticated", user: refreshed.session.user });
          return;
        }

        // Step 4 — verify session is actually accepted by Supabase
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          await clearStaleAuth();
          if (!cancelled) router.replace("/auth");
          return;
        }

        // Step 5 — all good
        if (!cancelled) setState({ status: "authenticated", user });

      } catch {
        // Any unexpected error — clear and redirect, never leave in broken state
        await clearStaleAuth();
        if (!cancelled) router.replace("/auth");
      }
    };

    validate();
    return () => { cancelled = true; };
  }, []);

  return state;
}
