"use client";
import { useState } from "react";
import Link from "next/link";

export default function UpgradePrompt({ quotesUsed = 5, onDismiss }: {
  quotesUsed?: number;
  onDismiss?: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    const res = await fetch("/api/stripe/create-checkout-session", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-950 p-7 shadow-2xl">
        <div className="text-3xl mb-3 text-center">🚀</div>
        <h2 className="text-xl font-bold text-center mb-2">Free plan limit reached</h2>
        <p className="text-zinc-400 text-sm text-center leading-relaxed mb-6">
          You've used all <strong className="text-white">{quotesUsed} free quotes</strong> this month.
          Upgrade to Pro for unlimited quotes and no ads.
        </p>
        <div className="space-y-2.5">
          <button onClick={handleUpgrade} disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-bold text-sm transition disabled:opacity-50">
            {loading ? "Redirecting..." : "Upgrade to Pro — £4.99/mo"}
          </button>
          <Link href="/pricing"
            className="block w-full py-3 rounded-2xl border border-zinc-700 text-zinc-400 hover:text-white text-sm text-center transition">
            See what's included →
          </Link>
          {onDismiss && (
            <button onClick={onDismiss}
              className="w-full text-center text-xs text-zinc-600 hover:text-zinc-400 transition py-1">
              Maybe later
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
