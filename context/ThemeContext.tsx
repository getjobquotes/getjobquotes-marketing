"use client";
// Compatibility shim — theme is now owned by PreferencesContext.
// This keeps any existing useTheme() / <ThemeProvider> usage working
// without a second system fighting over the .dark class.
import type { ReactNode } from "react";
import { usePreferences } from "./PreferencesContext";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useTheme() {
  const { prefs, setPref } = usePreferences();
  return {
    theme: prefs.theme,
    toggle: () => setPref("theme", prefs.theme === "dark" ? "light" : "dark"),
    setTheme: (t: "dark" | "light") => setPref("theme", t),
  };
}
