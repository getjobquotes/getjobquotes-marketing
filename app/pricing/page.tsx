"use client";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { usePlan } from "@/lib/usePlan";
import { useState } from "react";
import Link from "next/link";
import TopNav from "@/components/TopNav";

export default function PricingPage() {
  const auth = useAuthGuard();
  const plan = usePlan(auth.status === "authenticated" ? auth.user.id : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpgrade = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/stripe/create-checkout-session", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError(data.error || "Something went wrong");
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  const handleManage = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {}
    setLoading(false);
  };

  if (auth.status === "loading") return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-zinc-600 text-sm animate-pulse">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {auth.status === "authenticated" && <TopNav />}
      <div className="max-w-3xl mx-auto px-5 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Simple pricing</h1>
          <p className="text-zinc-400 text-base">Start free. Upgrade when you need more.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">

          {/* FREE */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Free</h2>
              {plan.plan === "free" && !plan.loading && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 font-medium">Current plan</span>
              )}
            </div>
            <p className="text-3xl font-bold mb-1">£0</p>
            <p className="text-zinc-500 text-sm mb-6">forever</p>
            <div className="space-y-2.5 mb-8">
              {["5 quotes per month","Unlimited invoices","PDF generation","Customer management","Trade calculator","WhatsApp sharing"].map(f => (
                <div key={f} className="flex items-center gap-2.5 text-sm text-zinc-400">
                  <span className="text-green-400">✓</span>{f}
                </div>
              ))}
              <div className="flex items-center gap-2.5 text-sm text-zinc-600"><span>✗</span>Ads shown</div>
            </div>
            <div className="w-full py-3 rounded-2xl border border-zinc-700 text-sm text-zinc-500 text-center">
              {plan.plan === "free" ? "You're on Free" : "Free plan"}
            </div>
          </div>

          {/* PRO */}
          <div className="rounded-3xl border border-green-600/30 bg-green-600/5 p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Pro</h2>
              {plan.isPro && !plan.loading && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-green-600/20 text-green-400 border border-green-600/30 font-medium">Current plan</span>
              )}
            </div>
            <p className="text-3xl font-bold mb-1">£5.99</p>
            <p className="text-zinc-500 text-sm mb-6">per month</p>
            <div className="space-y-2.5 mb-8">
              {["Unlimited quotes","Unlimited invoices","PDF generation","Customer management","Trade calculator","WhatsApp sharing","No ads","Priority support"].map(f => (
                <div key={f} className="flex items-center gap-2.5 text-sm text-zinc-300">
                  <span className="text-green-400">✓</span>{f}
                </div>
              ))}
            </div>
            {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
            {plan.isPro ? (
              <button onClick={handleManage} disabled={loading}
                className="w-full py-3 rounded-2xl border border-zinc-700 hover:border-zinc-500 text-sm font-medium text-zinc-300 hover:text-white transition disabled:opacity-50">
                {loading ? "Loading..." : "Manage Subscription"}
              </button>
            ) : (
              <button onClick={handleUpgrade} disabled={loading || plan.loading}
                className="w-full py-3 rounded-2xl bg-green-600 hover:bg-green-500 text-white text-sm font-bold transition disabled:opacity-50">
                {loading ? "Redirecting..." : "Upgrade to Pro — £5.99/mo"}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-8">
          Secure payment via Stripe · Cancel anytime · No hidden fees
        </p>
            {/* Apple Pay */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.39.07 2.35.77 3.17.8 1.21-.24 2.37-.97 3.67-.84 1.57.17 2.75.8 3.53 2.02-3.25 1.95-2.71 6.3.63 7.5-.73 1.93-1.67 3.83-3 4.4zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span className="text-xs text-zinc-400">Apple Pay</span>
            </div>
            {/* Google Pay */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900">
              <svg className="w-12 h-5" viewBox="0 0 48 20" fill="none">
                <path d="M22.6 10.2c0 3.4-2.6 5.8-5.8 5.8s-5.8-2.4-5.8-5.8 2.6-5.8 5.8-5.8 5.8 2.4 5.8 5.8z" fill="#4285F4"/>
                <path d="M22.6 10.2c0 3.4-2.6 5.8-5.8 5.8V4.4c3.2 0 5.8 2.4 5.8 5.8z" fill="#356AC3"/>
                <path d="M11 10.2c0-3.4 2.6-5.8 5.8-5.8v11.6c-3.2 0-5.8-2.4-5.8-5.8z" fill="#34A853"/>
                <text x="25" y="15" fill="white" fontSize="11" fontFamily="Arial">Pay</text>
              </svg>
            </div>
          </div>
          <p className="text-xs text-zinc-600">
            Secure payment · Cancel anytime · No hidden fees
          </p>
        </div>
        <div className="mt-6 text-center">
          <Link href="/dashboard" className="text-xs text-zinc-600 hover:text-zinc-400 transition">← Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
