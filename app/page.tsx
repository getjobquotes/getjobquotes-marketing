import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GetJobQuotes — Professional Quotes & Invoices for UK Trades",
  description: "Create professional quotes and invoices in under 2 minutes. Built for UK plumbers, electricians, builders and all tradespeople. 100% free.",
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black text-white">

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 sm:px-10 py-4 border-b border-white/5 bg-black/80 backdrop-blur-sm">
        <span className="text-lg font-bold"><span className="text-green-400">Get</span>JobQuotes</span>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/demo" className="hidden sm:inline-block px-4 py-2 text-sm font-semibold border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white rounded-xl transition">Try Demo</Link>
          <Link href="/auth?mode=login" className="px-3 py-2 text-sm text-zinc-400 hover:text-white transition">Log In</Link>
          <Link href="/auth?mode=signup" className="px-4 py-2 text-sm font-bold bg-green-600 hover:bg-green-500 rounded-xl transition">Start Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center pt-20">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-xs font-semibold mb-8">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            Free for UK tradespeople
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Quotes & Invoices<br /><span className="text-green-400">in 2 minutes</span>
          </h1>
          <p className="text-lg sm:text-xl text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Stop wasting time on paperwork. Professional PDFs your clients will trust — for every trade.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth?mode=signup" className="px-8 py-4 text-base font-bold bg-green-600 hover:bg-green-500 rounded-xl transition">
              Start Free — No Card Needed
            </Link>
            <Link href="/demo" className="px-8 py-4 text-base font-semibold border border-zinc-700 hover:border-zinc-500 rounded-xl transition text-zinc-300 hover:text-white">
              👀 Try Demo First
            </Link>
          </div>
          <p className="text-xs text-zinc-700 mt-4">No account needed for demo · Takes 30 seconds to sign up</p>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">Everything you need</h2>
        <p className="text-zinc-500 text-center mb-14 max-w-md mx-auto">Built for plumbers, electricians, builders — every trade.</p>
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { icon: "📋", title: "Professional Quotes", desc: "Clean branded PDFs in seconds. Your logo, your signature, your details." },
            { icon: "🔄", title: "Convert to Invoice", desc: "Turn any quote into an invoice in one click. No retyping." },
            { icon: "💬", title: "Share via WhatsApp", desc: "Send a link your client can view and accept online. No printing needed." },
            { icon: "✍️", title: "Online Acceptance", desc: "Clients accept quotes with a click. You get notified instantly." },
            { icon: "👥", title: "Saved Customers", desc: "Save client details and fill quotes in seconds on repeat jobs." },
            { icon: "📊", title: "Track Everything", desc: "See all quotes and invoices. Mark as paid. Know what's outstanding." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 hover:border-green-600/30 transition group">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="text-sm font-bold mb-1.5 group-hover:text-green-400 transition">{f.title}</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo CTA */}
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <div className="rounded-2xl border border-green-600/30 bg-green-600/5 p-8 sm:p-12 text-center">
          <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-3">No account needed</p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Try it right now</h2>
          <p className="text-zinc-400 text-sm mb-6 max-w-sm mx-auto">Create a real quote, add your details, download a professional PDF. Zero friction.</p>
          <Link href="/demo" className="inline-block px-8 py-3.5 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-white transition">
            Try the Free Demo →
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-zinc-500 mb-8 text-sm">Free forever. No credit card.</p>
        <Link href="/auth?mode=signup" className="inline-block px-10 py-4 text-lg font-bold bg-green-600 hover:bg-green-500 rounded-xl transition">
          Create Your Free Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 px-6 py-6 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-700">
        <span><span className="text-green-400">Get</span>JobQuotes.uk</span>
        <div className="flex flex-wrap gap-4">
          <Link href="/demo" className="hover:text-zinc-400 transition">Try Demo</Link>
          <Link href="/terms" className="hover:text-zinc-400 transition">Terms</Link>
          <Link href="/privacy" className="hover:text-zinc-400 transition">Privacy</Link>
          <Link href="/status" className="hover:text-zinc-400 transition">Status</Link>
        </div>
      </footer>
    </main>
  );
}
