"use client";
import { useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

const LS_KEY = "gjq_draft_backup";

// Resilient quote draft autosave:
// - Saves to Supabase (debounced)
// - Always mirrors to localStorage as instant backup
// - Retries failed DB saves
// - Saves on tab close / navigate away (beforeunload + visibilitychange)
// - Recovers from whichever source is newer (DB vs localStorage)
export function useDraftAutosave(
  userId: string | null,
  draft: any,
  enabled: boolean
) {
  const supabase = createClient();
  const timer = useRef<NodeJS.Timeout | null>(null);
  const lastSaved = useRef<string>("");
  const draftRef = useRef(draft);
  const retryCount = useRef(0);

  // Keep a live ref to the latest draft for unload handlers
  draftRef.current = draft;

  const hasContent = (d: any) =>
    d && (d.form?.clientName || (d.lineItems || []).some((i: any) => i.description || i.unitPrice));

  const saveToLocal = useCallback((d: any) => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ draft: d, savedAt: Date.now() }));
    } catch {}
  }, []);

  const saveToDB = useCallback(async (d: any) => {
    if (!userId) return false;
    try {
      const { error } = await supabase
        .from("quote_drafts")
        .upsert({ user_id: userId, draft: d }, { onConflict: "user_id" });
      if (error) throw error;
      retryCount.current = 0;
      return true;
    } catch {
      // Retry up to 3 times with backoff
      if (retryCount.current < 3) {
        retryCount.current++;
        setTimeout(() => saveToDB(d), 1000 * retryCount.current);
      }
      return false;
    }
  }, [userId]);

  // Debounced save on every change
  useEffect(() => {
    if (!enabled) return;
    if (!hasContent(draft)) return;

    const serialized = JSON.stringify(draft);
    if (serialized === lastSaved.current) return;

    // Instant localStorage backup (synchronous, never fails silently)
    saveToLocal(draft);

    // Debounced DB save
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      lastSaved.current = serialized;
      saveToDB(draft);
    }, 1500);

    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [draft, enabled, saveToDB, saveToLocal]);

  // Save immediately on tab close / navigate away / tab hidden
  useEffect(() => {
    if (!enabled) return;

    const flush = () => {
      const d = draftRef.current;
      if (!hasContent(d)) return;
      saveToLocal(d);
      // Best-effort DB save (may not complete on unload, localStorage covers it)
      if (userId) {
        try {
          navigator.sendBeacon?.(
            "/api/draft-save",
            new Blob([JSON.stringify({ userId, draft: d })], { type: "application/json" })
          );
        } catch {}
        saveToDB(d);
      }
    };

    const onVisibility = () => { if (document.visibilityState === "hidden") flush(); };

    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", onVisibility);
      flush(); // also flush on unmount (navigating to another page)
    };
  }, [enabled, userId, saveToDB, saveToLocal]);

  // Load the newest draft from DB or localStorage
  const loadDraft = useCallback(async (): Promise<any | null> => {
    let dbDraft: any = null;
    let dbTime = 0;
    if (userId) {
      try {
        const { data } = await supabase
          .from("quote_drafts")
          .select("draft, updated_at")
          .eq("user_id", userId)
          .single();
        if (data?.draft && hasContent(data.draft)) {
          dbDraft = data.draft;
          dbTime = data.updated_at ? new Date(data.updated_at).getTime() : 0;
        }
      } catch {}
    }

    let localDraft: any = null;
    let localTime = 0;
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (hasContent(parsed.draft)) {
          localDraft = parsed.draft;
          localTime = parsed.savedAt || 0;
        }
      }
    } catch {}

    // Return whichever is newer
    if (dbDraft && localDraft) return localTime > dbTime ? localDraft : dbDraft;
    return dbDraft || localDraft || null;
  }, [userId]);

  const clearDraft = useCallback(async () => {
    lastSaved.current = "";
    try { localStorage.removeItem(LS_KEY); } catch {}
    if (userId) {
      try { await supabase.from("quote_drafts").delete().eq("user_id", userId); } catch {}
    }
  }, [userId]);

  return { loadDraft, clearDraft };
}
