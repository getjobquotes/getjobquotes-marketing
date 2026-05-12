
// Temporarily disabled while product is free during validation.
// Stripe + plan logic preserved below but not enforced.
"use client";
import { useEffect, useState } from "react";

export type Plan = "free" | "pro";

export type PlanState = {
  plan: Plan;
  isPro: boolean;
  quotesThisMonth: number;
  quotesRemaining: number;
  limitReached: boolean;
  loading: boolean;
};

export function usePlan(_userId: string | null): PlanState {
  // Everyone gets unlimited access during free validation phase
  return {
    plan: "free",
    isPro: true,           // treated as pro — no limits enforced
    quotesThisMonth: 0,
    quotesRemaining: 999,
    limitReached: false,   // never blocked
    loading: false,
  };
}
