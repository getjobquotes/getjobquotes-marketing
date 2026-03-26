"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const steps = [
  {
    icon: "👋",
    title: "Welcome to GetJobQuotes!",
    desc: "Let's get you set up in 60 seconds. We'll show you how to create your first professional quote.",
    action: null,
    actionLabel: null,
  },
  {
    icon: "🏢",
    title: "Set up your business profile",
    desc: "Add your logo, business name and contact details. These appear on every quote and invoice you send.",
    action: "/profile",
    actionLabel: "Go to Profile →",
  },
  {
    icon: "👥",
    title: "Add your first customer",
    desc: "Save your regular clients so you can fill out new quotes in seconds — no retyping names and addresses.",
    action: "/customers",
    actionLabel: "Add a Customer →",
  },
  {
    icon: "📋",
    title: "Create your first quote",
    desc: "Add line items for labour and materials, toggle VAT on or off, and download a professional PDF instantly.",
    action: "/tool",
    actionLabel: "Create a Quote →",
  },
  {
    icon: "🔄",
    title: "Convert to invoice",
    desc: "When the job is approved, convert your quote to an invoice in one click. No retyping needed.",
    action: "/dashboard",
    actionLabel: "Go to Dashboard →",
  },
  {
    icon: "📱",
    title: "Send to your client",
    desc: "Share your quote via WhatsApp or email. Your client can view and accept it online — no printing needed.",
    action: null,
    actionLabel: null,
  },
  {
    icon: "🎉",
    title: "You're all set!",
    desc: "You're ready to start winning jobs with professional quotes. Create your first quote now.",
    action: "/tool",
    actionLabel: "Create First Quote →",
  },
];

export default function OnboardingTour({ userId }: { userId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if onboarding already complete
    supabase
      .from("profiles")
      .select("onboarding_complete")
      .eq("user_id", userId)
      .single()
      .then(({ data }) => {
        if (!data?.onboarding_complete) {
          setVisible(true);
        }
      });
  }, [userId]);

  const complete = async () => {
    await supabase
      .from("profiles")
      .update({ onboarding_complete: true })
      .eq("user_id", userId);
    setVisible(false);
  };

  const handleAction = async () => {
    const current = steps[step];
    if (step === steps.length - 1) {
      await complete();
      if (current.action) router.push(current.action);
    } else if (current.action) {
      router.push(current.action);
      setStep(s => s + 1);
    } else {
      setStep(s => s + 1);
    }
  };

  if (!visible) return null;

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden">

        {/* Progress bar */}
        <div className="h-1 bg-zinc-800">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="p-7">
          <div className="text-4xl mb-4 text-center">{current.icon}</div>
          <h2 className="text-xl font-bold text-white text-center mb-2">{current.title}</h2>
          <p className="text-zinc-400 text-sm text-center leading-relaxed mb-6">{current.desc}</p>

          <div className="space-y-2.5">
            {current.action ? (
              <button
                onClick={handleAction}
                className="w-full py-3 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-bold text-sm transition">
                {current.actionLabel || "Next →"}
              </button>
            ) : (
              <button
                onClick={() => isLast ? complete() : setStep(s => s + 1)}
                className="w-full py-3 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-bold text-sm transition">
                {isLast ? "Get Started →" : "Next →"}
              </button>
            )}

            {!isLast && (
              <button
                onClick={() => setStep(s => s + 1)}
                className="w-full py-2 text-xs text-zinc-600 hover:text-zinc-400 transition">
                Skip this step
              </button>
            )}
          </div>

          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-zinc-700">{step + 1} of {steps.length}</span>
            <button onClick={complete} className="text-xs text-zinc-700 hover:text-zinc-400 transition">
              Skip tour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
