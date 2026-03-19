"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const FREE_QUOTE_LIMIT = 5;

export type Plan = "free" | "pro";

export type PlanState = {
  plan: Plan;
  isPro: boolean;
  quotesThisMonth: number;
  quotesRemaining: number;
  limitReached: boolean;
  loading: boolean;
};

export function usePlan(userId: string | null): PlanState {
  const supabase = createClient();
  const [state, setState] = useState<PlanState>({
    plan: "free",
    isPro: false,
    quotesThisMonth: 0,
    quotesRemaining: FREE_QUOTE_LIMIT,
    limitReached: false,
    loading: true,
  });

  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      // Get plan
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan, subscription_status")
        .eq("user_id", userId)
        .single();

      const plan: Plan = profile?.plan === "pro" ? "pro" : "free";
      const isPro = plan === "pro";

      // Count quotes this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from("documents")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("type", "quote")
        .gte("created_at", startOfMonth.toISOString());

      const quotesThisMonth = count || 0;
      const quotesRemaining = isPro
        ? Infinity
        : Math.max(0, FREE_QUOTE_LIMIT - quotesThisMonth);
      const limitReached = !isPro && quotesThisMonth >= FREE_QUOTE_LIMIT;

      setState({
        plan,
        isPro,
        quotesThisMonth,
        quotesRemaining,
        limitReached,
        loading: false,
      });
    };

    load();
  }, [userId]);

  return state;
}
