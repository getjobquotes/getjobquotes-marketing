"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type AuthState =
  | { status: "loading" }
  | { status: "authenticated"; user: any }
  | { status: "unauthenticated" };

export function useAuthGuard(): AuthState {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // No session — clear any stale keys and redirect once
        try {
          Object.keys(localStorage)
            .filter(k => k.startsWith("sb-"))
            .forEach(k => localStorage.removeItem(k));
        } catch {}
        router.replace("/auth");
      } else {
        setState({ status: "authenticated", user: session.user });
      }
    });
  }, []);

  return state;
}
