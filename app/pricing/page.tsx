
"use client";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import AppFooter from "@/components/AppFooter";
import PublicFooter from "@/components/PublicFooter";
import { useAuthGuard } from "@/lib/useAuthGuard";

const included = [
  "Unlimited quotes",
  "Unlimited invoices",
  "PDF downloads",
  "Customer management",
  "Trade calculator",
  "WhatsApp and email sharing",
  "Online quote acceptance",
  "UK VAT support",
  "Mobile and desktop",
  "No card required",
];

export default function PricingPage() {
  const auth = useAuthGuard();
  const isLoggedIn = auth.status === "authenticated";

  return (
    <div className="min-h-screen bg-black text-white">
      {isLoggedIn ? <TopNav /> : (
        <nav className="sticky top-0 z-50 border-b border-zinc-900 bg-black/95 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
            <Link href="/" className="text-base font-bold">
              <span className="text-green-400">Get</span>JobQuotes
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/auth" className="text-sm text-zinc-400 hover:text-white transition">Log In</Link>
              <Link href="/auth?mode=signup"
                className="px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-500 text-white rounded-xl transition">
                Try Free
              </Link>
            </div>
          </div>
        </nav>
      )}

      <div className="max-w-2xl mx-auto px-5 py-16">
        <div className="text-center mb-10">
          <p className="text-xs text-green-400 font-semibold uppercase tracking-widest mb-3">Pricing</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Currently free</h1>
          <p className="text-zinc-400 text-base leading-relaxed max-w-lg mx-auto">
            GetJobQuotes is free to use while we build it with real users.
            No card required. No hidden limits. Everything included.
          </p>
        </div>

        <div className="rounded-3xl border border-green-600/30 bg-green-600/5 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Free</h2>
              <p className="text-zinc-400 text-sm">while we validate the product</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-green-400">£0</p>
              <p className="text-zinc-500 text-xs">no card needed</p>
            </div>
          </div>
          <div className="space-y-2.5 mb-8">
            {included.map(f => (
              <div key={f} className="flex items-center gap-2.5 text-sm text-zinc-300">
                <span className="text-green-400">✓</span>{f}
              </div>
            ))}
          </div>
          {isLoggedIn ? (
            <Link href="/tool"
              className="block w-full py-3.5 rounded-2xl bg-green-600 hover:bg-green-500 text-white text-sm font-bold transition text-center">
              Create a Quote →
            </Link>
          ) : (
            <Link href="/auth?mode=signup"
              className="block w-full py-3.5 rounded-2xl bg-green-600 hover:bg-green-500 text-white text-sm font-bold transition text-center">
              Start Free — No Card Needed
            </Link>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-sm text-zinc-400 leading-relaxed">
          <p className="font-semibold text-white mb-2">What about paid plans?</p>
          <p>
            Paid plans may be introduced later once the product is more mature.
            If that happens, existing users will be notified well in advance
            and given a fair transition period. Early users will always be looked after.
          </p>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-zinc-600 mb-3">Have feedback or a feature request?</p>
          <a href="mailto:hello@getjobquotes.uk"
            className="text-sm text-green-400 hover:text-green-300 transition">
            hello@getjobquotes.uk
          </a>
        </div>
      </div>

      {isLoggedIn ? <AppFooter /> : <PublicFooter />}
    </div>
  );
}
