"use client";
import { useOnboarding } from "@/lib/useOnboarding";
import Link from "next/link";

const STEPS = [
  { key: "completed_business_profile", label: "Add your business details", href: "/profile", cta: "Go to Profile →", desc: "Logo, name and contact info appears on every quote." },
  { key: "completed_first_customer",   label: "Save your first client",   href: "/customers", cta: "Add Customer →", desc: "Fill quotes in seconds on repeat jobs." },
  { key: "completed_first_quote",      label: "Create your first quote",  href: "/tool", cta: "Create Quote →", desc: "Add line items, download a PDF, send the link." },
  { key: "completed_first_invoice",    label: "Convert a quote to invoice", href: "/dashboard", cta: "View Dashboard →", desc: "One click from quote to invoice — no retyping." },
];

export default function OnboardingChecklist({ userId }: { userId: string }) {
  const { state, loading, progress, completedCount, allComplete, dismiss } = useOnboarding(userId);

  if (loading || state.dismissed || allComplete) return null;

  const nextStep = STEPS.find(s => !state[s.key as keyof typeof state]);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden mb-5">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-zinc-800/60">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white">Get set up</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 tabular-nums">
              {completedCount}/{STEPS.length}
            </span>
          </div>
          <button onClick={dismiss} className="text-zinc-700 hover:text-zinc-400 text-base transition" title="Dismiss">×</button>
        </div>
        {/* Progress bar */}
        <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Steps */}
      <div className="divide-y divide-zinc-800/40">
        {STEPS.map(step => {
          const done = state[step.key as keyof typeof state] as boolean;
          const isNext = !done && step === nextStep;
          return (
            <div key={step.key}
              className={`flex items-center gap-3 px-4 py-3 transition ${done ? "opacity-50" : isNext ? "bg-zinc-800/20" : ""}`}>
              {/* Tick */}
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                done ? "bg-green-600 border-green-600" : isNext ? "border-green-500" : "border-zinc-700"
              }`}>
                {done && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                    <path d="M1.5 5l3 3 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug ${done ? "line-through text-zinc-600" : "text-zinc-200 font-medium"}`}>
                  {step.label}
                </p>
                {!done && isNext && (
                  <p className="text-xs text-zinc-600 mt-0.5 leading-relaxed">{step.desc}</p>
                )}
              </div>
              {/* CTA — only on next step */}
              {!done && isNext && (
                <Link href={step.href}
                  className="shrink-0 text-xs font-semibold text-green-400 hover:text-green-300 transition whitespace-nowrap">
                  {step.cta}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
