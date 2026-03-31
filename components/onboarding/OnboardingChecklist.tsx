"use client";
import { useOnboarding } from "@/lib/useOnboarding";
import Link from "next/link";

interface Step {
  key: string;
  label: string;
  desc: string;
  href: string;
  cta: string;
}

const STEPS: Step[] = [
  {
    key: "completed_business_profile",
    label: "Set up your business profile",
    desc: "Add your logo, business name and contact details.",
    href: "/profile",
    cta: "Go to Profile →",
  },
  {
    key: "completed_first_customer",
    label: "Add your first customer",
    desc: "Save a client so you can fill quotes instantly.",
    href: "/customers",
    cta: "Add Customer →",
  },
  {
    key: "completed_first_quote",
    label: "Create your first quote",
    desc: "Add line items, download a PDF, send to your client.",
    href: "/tool",
    cta: "Create Quote →",
  },
  {
    key: "completed_first_invoice",
    label: "Convert a quote to an invoice",
    desc: "Turn an approved quote into an invoice in one click.",
    href: "/dashboard",
    cta: "Go to Dashboard →",
  },
  {
    key: "completed_first_send",
    label: "Send a quote to a client",
    desc: "Share your quote by email or WhatsApp link.",
    href: "/tool",
    cta: "Send a Quote →",
  },
];

export default function OnboardingChecklist({ userId }: { userId: string }) {
  const { state, loading, progress, completedCount, totalSteps, allComplete, dismiss } =
    useOnboarding(userId);

  // Don't render if loading, dismissed, or all complete for >1 day
  if (loading || state.dismissed) return null;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden mb-6">

      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-zinc-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-sm font-bold text-white">
                {allComplete ? "🎉 You're fully set up!" : "Get started with GetJobQuotes"}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-600/20 text-green-400 border border-green-600/30 font-medium">
                {completedCount}/{totalSteps}
              </span>
            </div>
            {allComplete ? (
              <p className="text-xs text-zinc-400">
                You've completed all steps. You're ready to use GetJobQuotes like a pro.
              </p>
            ) : (
              <p className="text-xs text-zinc-500">
                Complete these steps to get the most out of GetJobQuotes.
              </p>
            )}
          </div>
          <button
            onClick={dismiss}
            className="text-zinc-600 hover:text-zinc-400 text-lg leading-none transition shrink-0 mt-0.5"
            title="Dismiss">
            ×
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-zinc-600">{progress}% complete</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="divide-y divide-zinc-800/60">
        {STEPS.map((step) => {
          const done = state[step.key as keyof typeof state] as boolean;
          return (
            <div key={step.key}
              className={`flex items-start gap-3 px-5 py-3.5 transition ${
                done ? "opacity-60" : "hover:bg-zinc-800/30"
              }`}>

              {/* Checkbox */}
              <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                done ? "bg-green-600 border-green-600" : "border-zinc-600"
              }`}>
                {done && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                    <path d="M1.5 5l3 3 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium leading-snug ${done ? "line-through text-zinc-500" : "text-zinc-200"}`}>
                  {step.label}
                </p>
                {!done && (
                  <p className="text-xs text-zinc-600 mt-0.5 leading-relaxed">{step.desc}</p>
                )}
              </div>

              {/* CTA */}
              {!done && (
                <Link href={step.href}
                  className="shrink-0 text-xs text-green-400 hover:text-green-300 font-medium transition whitespace-nowrap mt-0.5">
                  {step.cta}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* All complete footer */}
      {allComplete && (
        <div className="px-5 py-4 bg-green-600/5 border-t border-green-600/20">
          <p className="text-xs text-green-400 text-center">
            ✅ All steps complete — you're ready to win more jobs with GetJobQuotes
          </p>
        </div>
      )}
    </div>
  );
}
