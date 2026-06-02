"use client";
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

export type Preferences = {
  theme: "dark" | "light";
  tour_completed: boolean;
  onboarding_dismissed: boolean;
  default_vat: boolean;
  last_dashboard_tab: "quotes" | "invoices";
};

const DEFAULTS: Preferences = {
  theme: "dark",
  tour_completed: false,
  onboarding_dismissed: false,
  default_vat: false,
  last_dashboard_tab: "quotes",
};

type PrefsContextType = {
  prefs: Preferences;
  loading: boolean;
  setPref: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  ready: boolean;
};

const PrefsContext = createContext<PrefsContextType>({
  prefs: DEFAULTS,
  loading: true,
  setPref: () => {},
  ready: false,
});

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [prefs, setPrefs] = useState<Preferences>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Load prefs once on mount
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      // Apply localStorage theme instantly to avoid flash
      try {
        const cached = localStorage.getItem("gjq_theme");
        if (cached === "light" || cached === "dark") {
          setPrefs(p => ({ ...p, theme: cached as "dark" | "light" }));
          applyTheme(cached as "dark" | "light");
        }
      } catch {}

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); setReady(true); return; }
      if (cancelled) return;
      setUserId(user.id);

      const { data } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (cancelled) return;

      if (data) {
        const loaded: Preferences = {
          theme: data.theme === "light" ? "light" : "dark",
          tour_completed: !!data.tour_completed,
          onboarding_dismissed: !!data.onboarding_dismissed,
          default_vat: !!data.default_vat,
          last_dashboard_tab: data.last_dashboard_tab === "invoices" ? "invoices" : "quotes",
        };
        setPrefs(loaded);
        applyTheme(loaded.theme);
        try { localStorage.setItem("gjq_theme", loaded.theme); } catch {}
      } else {
        // Create initial row
        await supabase.from("user_preferences").insert({ user_id: user.id, ...DEFAULTS });
      }
      setLoading(false);
      setReady(true);
    };

    load().catch(() => { setLoading(false); setReady(true); });
    return () => { cancelled = true; };
  }, []);

  const setPref = useCallback(<K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPrefs(prev => {
      const next = { ...prev, [key]: value };
      // Apply theme immediately
      if (key === "theme") {
        applyTheme(value as "dark" | "light");
        try { localStorage.setItem("gjq_theme", value as string); } catch {}
      }
      // Persist to DB (fire and forget)
      if (userId) {
        supabase.from("user_preferences")
          .update({ [key]: value })
          .eq("user_id", userId)
          .then(() => {});
      }
      return next;
    });
  }, [userId]);

  return (
    <PrefsContext.Provider value={{ prefs, loading, setPref, ready }}>
      {children}
    </PrefsContext.Provider>
  );
}

function applyTheme(theme: "dark" | "light") {
  try {
    const root = document.documentElement;
    if (theme === "light") root.classList.remove("dark");
    else root.classList.add("dark");
  } catch {}
}

export const usePreferences = () => useContext(PrefsContext);
