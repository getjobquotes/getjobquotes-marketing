"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export type OnboardingState = {
  completed_business_profile: boolean;
  completed_first_customer: boolean;
  completed_first_quote: boolean;
  completed_first_invoice: boolean;
  completed_first_send: boolean;
  dismissed: boolean;
};

export type OnboardingStep = keyof Omit<OnboardingState, "dismissed">;

const DEFAULT_STATE: OnboardingState = {
  completed_business_profile: false,
  completed_first_customer: false,
  completed_first_quote: false,
  completed_first_invoice: false,
  completed_first_send: false,
  dismissed: false,
};

// GA4 event tracking
function trackEvent(eventName: string, params?: Record<string, unknown>) {
  try {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", eventName, params);
    }
  } catch {}
}

export function useOnboarding(userId: string | null) {
  const supabase = createClient();
  const [state, setState] = useState<OnboardingState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);

  const completedCount = [
    state.completed_business_profile,
    state.completed_first_customer,
    state.completed_first_quote,
    state.completed_first_invoice,
    state.completed_first_send,
  ].filter(Boolean).length;

  const totalSteps = 5;
  const progress = Math.round((completedCount / totalSteps) * 100);
  const allComplete = completedCount === totalSteps;

  // Load onboarding state
  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      const { data, error } = await supabase
        .from("user_onboarding_state")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error || !data) {
        // Create initial row
        const { data: newRow } = await supabase
          .from("user_onboarding_state")
          .insert({ user_id: userId, ...DEFAULT_STATE })
          .select()
          .single();

        if (newRow) {
          setState(newRow as OnboardingState);
          trackEvent("onboarding_started", { user_id: userId });
        }
      } else {
        setState(data as OnboardingState);
      }
      setLoading(false);
    };

    load().catch(() => setLoading(false));
  }, [userId]);

  // Mark a step complete
  const markComplete = useCallback(async (step: OnboardingStep) => {
    if (!userId || state[step]) return; // already complete

    const update = { [step]: true };
    setState(prev => ({ ...prev, ...update }));

    await supabase
      .from("user_onboarding_state")
      .update(update)
      .eq("user_id", userId);

    // Track event
    const eventMap: Record<OnboardingStep, string> = {
      completed_business_profile: "business_profile_completed",
      completed_first_customer: "first_customer_created",
      completed_first_quote: "first_quote_created",
      completed_first_invoice: "first_invoice_created",
      completed_first_send: "first_quote_sent",
    };
    trackEvent(eventMap[step]);

    // Check if all complete
    const newState = { ...state, ...update };
    const allDone = [
      newState.completed_business_profile,
      newState.completed_first_customer,
      newState.completed_first_quote,
      newState.completed_first_invoice,
      newState.completed_first_send,
    ].every(Boolean);

    if (allDone) trackEvent("onboarding_completed");
  }, [userId, state]);

  // Dismiss checklist
  const dismiss = useCallback(async () => {
    if (!userId) return;
    setState(prev => ({ ...prev, dismissed: true }));
    await supabase
      .from("user_onboarding_state")
      .update({ dismissed: true })
      .eq("user_id", userId);
  }, [userId]);

  return { state, loading, progress, completedCount, totalSteps, allComplete, markComplete, dismiss };
}
