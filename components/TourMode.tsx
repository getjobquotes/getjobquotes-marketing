"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// ── Tour step definitions ─────────────────────────────────
const STEPS = [
  {
    icon: "👋",
    title: "Welcome to GetJobQuotes",
    desc: "You're in. This is a quick tour of the app — takes about 2 minutes. You can skip at any time and replay it from Settings.",
    visual: "welcome",
  },
  {
    icon: "📊",
    title: "Your Dashboard",
    desc: "This is home base. Every quote and invoice you create lives here. Search, filter and manage everything from one place.",
    visual: "dashboard",
  },
  {
    icon: "📈",
    title: "Track your numbers",
    desc: "See how many quotes you've sent, invoices raised and how much is outstanding. Updates automatically as you work.",
    visual: "stats",
  },
  {
    icon: "➕",
    title: "Creating a quote",
    desc: "Click New Quote in the navigation to start any job. Fill in the client, add your line items and the total calculates for you.",
    visual: "newquote",
  },
  {
    icon: "📋",
    title: "The quote builder",
    desc: "Add line items for labour, materials and anything else. Description, quantity and unit price — the subtotal updates as you type.",
    visual: "builder",
  },
  {
    icon: "💷",
    title: "UK VAT built in",
    desc: "Toggle VAT on or off per quote. Subtotal, VAT amount and total shown separately on the PDF — exactly how HMRC expects.",
    visual: "vat",
  },
  {
    icon: "📄",
    title: "Professional PDF in one click",
    desc: "Download a branded PDF with your business name, logo and signature. Looks the part without any design work on your end.",
    visual: "pdf",
  },
  {
    icon: "🔗",
    title: "Share with a link",
    desc: "Every quote gets a unique link. Send by WhatsApp or email. Your client views and accepts it online — no app or login needed.",
    visual: "share",
  },
  {
    icon: "🔄",
    title: "Quote to invoice — one click",
    desc: "When a job is approved, hit Convert to Invoice from your dashboard. All details carry over. No retyping anything.",
    visual: "convert",
  },
  {
    icon: "👥",
    title: "Save your regular clients",
    desc: "Go to Customers and save client details once. Next time you quote for them, pick their name and the form fills itself.",
    visual: "customers",
  },
  {
    icon: "🏢",
    title: "Your business profile",
    desc: "Add your logo, signature, business name and contact info in Profile. These appear on every quote and invoice you generate.",
    visual: "profile",
  },
  {
    icon: "🧮",
    title: "Built-in trade calculator",
    desc: "The Calculator button bottom-left is always available — VAT, markup, day rates and materials. No need to leave the page.",
    visual: "calculator",
  },
  {
    icon: "🚀",
    title: "You're all set",
    desc: "That's everything. GetJobQuotes is completely free to use. Create your first real quote now — it takes under 2 minutes.",
    visual: "done",
    isFinal: true,
  },
] as const;

// ── Mini visuals for each step ────────────────────────────
function StepVisual({ type }: { type: string }) {
  const base = "w-full rounded-2xl border border-zinc-700/50 bg-zinc-900 overflow-hidden";

  if (type === "welcome") return (
    <div className={`${base} p-6 flex flex-col items-center justify-center gap-3`} style={{ minHeight: 140 }}>
      <div className="text-4xl font-bold"><span className="text-green-400">Get</span><span className="text-white">JobQuotes</span></div>
      <p className="text-xs text-zinc-500 text-center">Professional quotes and invoices for UK tradespeople</p>
      <div className="flex gap-2 mt-1">
        {["Quotes","Invoices","PDF","VAT","Calculator"].map(t => (
          <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">{t}</span>
        ))}
      </div>
    </div>
  );

  if (type === "dashboard") return (
    <div className={`${base} p-4`} style={{ minHeight: 140 }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-green-400" />
        <span className="text-xs text-zinc-400 font-medium">Dashboard</span>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        {[["QUOTES","3"],["INVOICES","5"],["TOTAL INVOICED","£3,240"],["PENDING","2 invoices"]].map(([l,v]) => (
          <div key={l} className="rounded-xl border border-zinc-700 bg-zinc-800/50 px-3 py-2">
            <p className="text-xs text-zinc-600">{l}</p>
            <p className="text-sm font-bold text-white">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );

  if (type === "stats") return (
    <div className={`${base} p-4`} style={{ minHeight: 140 }}>
      <div className="space-y-2">
        {[["Quotes sent this month","8","text-blue-400"],["Invoices raised","12","text-green-400"],["Total invoiced","£14,200","text-green-400"],["Outstanding","£2,400","text-yellow-400"]].map(([l,v,c]) => (
          <div key={l} className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
            <span className="text-xs text-zinc-500">{l}</span>
            <span className={`text-sm font-bold ${c}`}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (type === "newquote") return (
    <div className={`${base} p-4 flex flex-col items-center justify-center gap-4`} style={{ minHeight: 140 }}>
      <div className="flex items-center gap-3">
        <div className="h-9 px-4 rounded-xl bg-green-600 text-white text-sm font-bold flex items-center gap-1.5">
          <span>+</span><span>New Quote</span>
        </div>
        <div className="h-9 px-4 rounded-xl border border-zinc-700 text-zinc-400 text-sm flex items-center gap-1.5">
          <span>👥</span><span>Customers</span>
        </div>
        <div className="h-9 px-4 rounded-xl border border-zinc-700 text-zinc-400 text-sm flex items-center gap-1.5">
          <span>🏢</span><span>Profile</span>
        </div>
      </div>
      <p className="text-xs text-zinc-600">Navigation bar — available on every page</p>
    </div>
  );

  if (type === "builder") return (
    <div className={`${base} p-4`} style={{ minHeight: 140 }}>
      <p className="text-xs text-zinc-600 mb-2 font-medium uppercase tracking-wider">Line Items</p>
      <div className="space-y-1.5">
        {[["Labour — boiler service (2hrs)","2","£65.00","£130.00"],["Parts — thermostat","1","£45.00","£45.00"],["Call-out charge","1","£30.00","£30.00"]].map(([d,q,u,t]) => (
          <div key={d} className="grid grid-cols-12 gap-1 text-xs">
            <span className="col-span-6 text-zinc-400 truncate">{d}</span>
            <span className="col-span-1 text-zinc-500 text-center">{q}</span>
            <span className="col-span-2 text-zinc-500 text-right">{u}</span>
            <span className="col-span-3 text-green-400 text-right font-medium">{t}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-zinc-700 mt-2 pt-2 flex justify-between">
        <span className="text-xs text-zinc-500">Total</span>
        <span className="text-sm font-bold text-green-400">£205.00</span>
      </div>
    </div>
  );

  if (type === "vat") return (
    <div className={`${base} p-4 flex flex-col gap-3`} style={{ minHeight: 140 }}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">Include VAT (20%)</span>
        <div className="w-10 h-5 rounded-full bg-green-600 relative">
          <div className="absolute top-0.5 left-5 w-4 h-4 rounded-full bg-white" />
        </div>
      </div>
      <div className="rounded-xl border border-green-600/20 bg-green-600/5 p-3 space-y-1">
        <div className="flex justify-between text-xs text-zinc-500"><span>Subtotal</span><span>£205.00</span></div>
        <div className="flex justify-between text-xs text-zinc-500"><span>VAT (20%)</span><span>£41.00</span></div>
        <div className="flex justify-between text-sm font-bold"><span className="text-white">Total</span><span className="text-green-400">£246.00</span></div>
      </div>
    </div>
  );

  if (type === "pdf") return (
    <div className={`${base} p-3`} style={{ minHeight: 140 }}>
      <div className="rounded-xl bg-zinc-800 p-3">
        <div className="h-6 bg-zinc-700 rounded mb-2 flex items-center px-2">
          <span className="text-green-400 text-xs font-bold mr-2">QUOTE</span>
          <span className="text-zinc-500 text-xs">QUO-123456 · 18 May 2026</span>
        </div>
        <div className="space-y-1">
          {["Labour — boiler service","Parts — thermostat","Call-out charge"].map(l => (
            <div key={l} className="h-4 bg-zinc-700/50 rounded text-xs flex items-center px-2">
              <span className="text-zinc-500">{l}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 h-5 bg-green-600 rounded flex items-center justify-between px-2">
          <span className="text-white text-xs font-bold">TOTAL</span>
          <span className="text-white text-xs font-bold">£246.00</span>
        </div>
      </div>
    </div>
  );

  if (type === "share") return (
    <div className={`${base} p-4 flex flex-col gap-3`} style={{ minHeight: 140 }}>
      <div className="flex items-center gap-2 bg-zinc-800 rounded-xl px-3 py-2">
        <span className="text-green-400 text-xs">🔗</span>
        <span className="text-xs text-zinc-400 flex-1 truncate">getjobquotes.uk/q/a3f9k2p...</span>
        <span className="text-xs text-zinc-600 border border-zinc-700 px-2 py-0.5 rounded-lg">Copy</span>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 rounded-xl border border-zinc-700 px-3 py-2 text-center">
          <span className="text-sm">📱</span>
          <p className="text-xs text-zinc-500 mt-0.5">WhatsApp</p>
        </div>
        <div className="flex-1 rounded-xl border border-zinc-700 px-3 py-2 text-center">
          <span className="text-sm">📧</span>
          <p className="text-xs text-zinc-500 mt-0.5">Email</p>
        </div>
        <div className="flex-1 rounded-xl border border-green-600/30 bg-green-600/10 px-3 py-2 text-center">
          <span className="text-sm">✅</span>
          <p className="text-xs text-green-400 mt-0.5">Accepted</p>
        </div>
      </div>
    </div>
  );

  if (type === "convert") return (
    <div className={`${base} p-4`} style={{ minHeight: 140 }}>
      <div className="flex items-center gap-3">
        <div className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 p-3">
          <p className="text-xs text-zinc-500 mb-1">QUOTE</p>
          <p className="text-sm font-bold text-white">QUO-123456</p>
          <p className="text-xs text-zinc-500">Smith Plumbing · £246.00</p>
        </div>
        <div className="text-2xl text-green-400">→</div>
        <div className="flex-1 rounded-xl border border-green-600/30 bg-green-600/5 p-3">
          <p className="text-xs text-green-400 mb-1">INVOICE</p>
          <p className="text-sm font-bold text-white">INV-123456</p>
          <p className="text-xs text-zinc-500">Same details · £246.00</p>
        </div>
      </div>
      <p className="text-xs text-zinc-600 text-center mt-3">One click — no retyping</p>
    </div>
  );

  if (type === "customers") return (
    <div className={`${base} p-4`} style={{ minHeight: 140 }}>
      <div className="space-y-2">
        {[["JT","James Taylor","07700 900123","Manchester"],["SK","Sarah Khan","07700 900456","London"],["MR","Mike Roberts","07700 900789","Birmingham"]].map(([i,n,p,l]) => (
          <div key={n} className="flex items-center gap-3 border-b border-zinc-800 pb-2">
            <div className="w-7 h-7 rounded-full bg-green-600/20 text-green-400 text-xs font-bold flex items-center justify-center shrink-0">{i}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium">{n}</p>
              <p className="text-xs text-zinc-600">{l}</p>
            </div>
            <span className="text-xs text-green-400 border border-green-600/30 px-2 py-0.5 rounded-lg">+ Quote</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (type === "profile") return (
    <div className={`${base} p-4 flex items-center gap-4`} style={{ minHeight: 140 }}>
      <div className="w-16 h-16 rounded-2xl bg-zinc-700 flex items-center justify-center text-2xl shrink-0">🏢</div>
      <div className="flex-1 space-y-2">
        {[["Business name","Smith Plumbing Ltd"],["Email","smith@email.co.uk"],["Phone","07700 900000"]].map(([l,v]) => (
          <div key={l}>
            <p className="text-xs text-zinc-600">{l}</p>
            <p className="text-sm text-white">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );

  if (type === "calculator") return (
    <div className={`${base} p-4`} style={{ minHeight: 140 }}>
      <div className="flex gap-1 mb-3">
        {["🔢 Calc","📈 Markup","🧾 VAT","📅 Day Rate"].map((t,i) => (
          <span key={t} className={`text-xs px-2 py-1 rounded-lg ${i === 2 ? "bg-green-600 text-white" : "bg-zinc-800 text-zinc-500"}`}>{t}</span>
        ))}
      </div>
      <div className="rounded-xl border border-zinc-700 p-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-zinc-500">Amount (ex VAT)</span>
          <span className="text-white font-medium">£205.00</span>
        </div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-zinc-500">VAT (20%)</span>
          <span className="text-yellow-400">£41.00</span>
        </div>
        <div className="flex justify-between text-sm font-bold border-t border-zinc-700 pt-1 mt-1">
          <span className="text-zinc-400">Total inc VAT</span>
          <span className="text-green-400">£246.00</span>
        </div>
      </div>
    </div>
  );

  if (type === "done") return (
    <div className={`${base} p-6 flex flex-col items-center justify-center gap-3`} style={{ minHeight: 140 }}>
      <div className="w-16 h-16 rounded-full bg-green-600/20 border border-green-600/30 flex items-center justify-center text-3xl">✅</div>
      <p className="text-sm font-semibold text-white">Tour complete</p>
      <div className="flex gap-2 flex-wrap justify-center">
        {["Quotes ✓","Invoices ✓","PDF ✓","Customers ✓","Calculator ✓"].map(t => (
          <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-green-600/20 text-green-400 border border-green-600/30">{t}</span>
        ))}
      </div>
    </div>
  );

  return null;
}

// ── Main component ────────────────────────────────────────
interface TourModeProps {
  userId: string;
  onClose?: () => void;
}

export default function TourMode({ userId, onClose }: TourModeProps) {
  const supabase = createClient();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("profiles")
      .select("tour_completed")
      .eq("user_id", userId)
      .single()
      .then(({ data }) => {
        if (!data?.tour_completed) {
          setVisible(true);
        }
      });
  }, [userId]);

  const markDone = async () => {
    await supabase
      .from("profiles")
      .update({ tour_completed: true })
      .eq("user_id", userId);
  };

  const goTo = (next: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
    }, 180);
  };

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      goTo(step + 1);
    } else {
      // Final step — mark complete and go to tool
      await markDone();
      setVisible(false);
      onClose?.();
      router.push("/tool?welcome=1");
    }
  };

  const handleBack = () => {
    if (step > 0) goTo(step - 1);
  };

  const handleSkip = async () => {
    await markDone();
    setVisible(false);
    onClose?.();
  };

  if (!visible) return null;

  const current = STEPS[step];
  const isFinal = step === STEPS.length - 1;
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`w-full max-w-md transition-all duration-180 ${animating ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
        style={{ transform: animating ? "scale(0.97)" : "scale(1)", opacity: animating ? 0 : 1 }}
      >
        {/* Card */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">

          {/* Progress bar */}
          <div className="h-1 bg-zinc-800">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="p-7">
            {/* Step counter */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs text-zinc-600 tabular-nums">
                {step + 1} of {STEPS.length}
              </span>
              <button
                onClick={handleSkip}
                className="text-xs text-zinc-600 hover:text-zinc-400 transition">
                Skip tour
              </button>
            </div>

            {/* Icon + title */}
            <div className="text-center mb-5">
              <div className="text-5xl mb-3">{current.icon}</div>
              <h2 className="text-xl font-bold text-white mb-2">{current.title}</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">{current.desc}</p>
            </div>

            {/* Visual */}
            <div className="mb-6">
              <StepVisual type={current.visual} />
            </div>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-1.5 mb-6">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`rounded-full transition-all ${
                    i === step
                      ? "w-5 h-1.5 bg-green-500"
                      : i < step
                      ? "w-1.5 h-1.5 bg-green-800"
                      : "w-1.5 h-1.5 bg-zinc-700"
                  }`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={handleBack}
                  className="px-4 py-3 rounded-xl border border-zinc-700 hover:border-zinc-500 text-sm text-zinc-400 hover:text-white transition">
                  ← Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-bold transition">
                {isFinal ? "Create my first quote →" : "Next →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
