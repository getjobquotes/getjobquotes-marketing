"use client";
import { useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

// Autosaves quote draft to Supabase every few seconds.
// Also loads any existing draft on mount.
export function useDraftAutosave(
  userId: string | null,
  draft: any,
  enabled: boolean
) {
  const supabase = createClient();
  const timer = useRef<NodeJS.Timeout | null>(null);
  const lastSaved = useRef<string>("");

  // Debounced save whenever draft changes
  useEffect(() => {
    if (!userId || !enabled) return;
    const serialized = JSON.stringify(draft);
    if (serialized === lastSaved.current) return;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      lastSaved.current = serialized;
      await supabase
        .from("quote_drafts")
        .upsert({ user_id: userId, draft }, { onConflict: "user_id" });
    }, 2000);

    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [userId, draft, enabled]);

  const loadDraft = useCallback(async (): Promise<any | null> => {
    if (!userId) return null;
    const { data } = await supabase
      .from("quote_drafts")
      .select("draft, updated_at")
      .eq("user_id", userId)
      .single();
    if (data?.draft && Object.keys(data.draft).length > 0) {
      return data.draft;
    }
    return null;
  }, [userId]);

  const clearDraft = useCallback(async () => {
    if (!userId) return;
    lastSaved.current = "";
    await supabase.from("quote_drafts").delete().eq("user_id", userId);
  }, [userId]);

  return { loadDraft, clearDraft };
}
