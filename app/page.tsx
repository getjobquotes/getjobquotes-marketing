import Link from "next/link";
import PublicFooter from "@/components/PublicFooter";
import EmailCapture from "@/components/EmailCapture";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GetJobQuotes — Professional Quotes & Invoices for UK Trades",
  description: "Create professional quotes and invoices in under 2 minutes. Built for UK plumbers, electricians, builders and all tradespeople. 100% free.",
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--text))]">

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 sm:px-10 py-4 border-b border-white/5 bg-black/80 backdrop-blur-sm">
        <span className="text-lg font-bold"><span className="text-green-400">Get</span>JobQuotes</span>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/demo" className="hidden sm:inline-block px-4 py-2 text-sm font-semibold border border-[rgb(var(--border-strong))] hover:border-[rgb(var(--border-strong))] text-[rgb(var(--text))] hover:text-[rgb(var(--text))] rounded-xl transition">Try Demo</Link>
          <Link href="/auth?mode=login" className="px-3 py-2 text-sm text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] transition">Log In</Link>
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
          <p className="text-lg sm:text-xl text-[rgb(var(--text-muted))] max-w-xl mx-auto mb-10 leading-relaxed">
            Stop wasting time on paperwork. Professional PDFs your clients will trust — for every trade.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth?mode=signup" className="px-8 py-4 text-base font-bold bg-green-600 hover:bg-green-500 rounded-xl transition">
              Start Free — No Card Needed
            </Link>
            <Link href="/demo" className="px-8 py-4 text-base font-semibold border border-[rgb(var(--border-strong))] hover:border-[rgb(var(--border-strong))] rounded-xl transition text-[rgb(var(--text))] hover:text-[rgb(var(--text))]">
              👀 Try Demo First
            </Link>
          </div>
          <p className="text-xs text-[rgb(var(--text-faint))] mt-4">No account needed for demo · Takes 30 seconds to sign up</p>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">Everything you need</h2>
        <p className="text-[rgb(var(--text-muted))] text-center mb-14 max-w-md mx-auto">Built for plumbers, electricians, builders — every trade.</p>
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { icon: "📋", title: "Professional Quotes", desc: "Clean branded PDFs in seconds. Your logo, your signature, your details." },
            { icon: "🔄", title: "Convert to Invoice", desc: "Turn any quote into an invoice in one click. No retyping." },
            { icon: "💬", title: "Share via WhatsApp", desc: "Send a link your client can view and accept online. No printing needed." },
            { icon: "✍️", title: "Online Acceptance", desc: "Clients accept quotes with a click. You get notified instantly." },
            { icon: "👥", title: "Saved Customers", desc: "Save client details and fill quotes in seconds on repeat jobs." },
            { icon: "📊", title: "Track Everything", desc: "See all quotes and invoices. Mark as paid. Know what's outstanding." },
            { icon: "🧮", title: "Trade Calculator", desc: "Markup, VAT, day rates and material costs — built right into your quote tool." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface)/0.5)] p-5 hover:border-green-600/30 transition group">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="text-sm font-bold mb-1.5 group-hover:text-green-400 transition">{f.title}</h3>
              <p className="text-[rgb(var(--text-muted))] text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo CTA */}
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <div className="rounded-2xl border border-green-600/30 bg-green-600/5 p-8 sm:p-12 text-center">
          <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-3">No account needed</p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Try it right now</h2>
          <p className="text-[rgb(var(--text-muted))] text-sm mb-6 max-w-sm mx-auto">Create a real quote, add your details, download a professional PDF. Zero friction.</p>
          <Link href="/demo" className="inline-block px-8 py-3.5 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-[rgb(var(--text))] transition">
            Try the Free Demo →
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-[rgb(var(--text-muted))] mb-8 text-sm">Free forever. No credit card.</p>
        <Link href="/auth?mode=signup" className="inline-block px-10 py-4 text-lg font-bold bg-green-600 hover:bg-green-500 rounded-xl transition">
          Create Your Free Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgb(var(--border))] px-5 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
            <div>
              <p className="text-sm font-bold mb-3">
                <span className="text-green-400">Get</span>JobQuotes
              </p>
              <p className="text-xs text-[rgb(var(--text-muted))] leading-relaxed">
                Professional quotes and invoices for UK tradespeople. Free to start.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-widest mb-3">Guides</p>
              <div className="space-y-2">
                <Link href="/guides/how-to-write-a-quote-uk" className="block text-xs text-[rgb(var(--text-faint))] hover:text-[rgb(var(--text-muted))] transition">How to Write a Quote</Link>
                <Link href="/guides/how-to-write-an-invoice-uk" className="block text-xs text-[rgb(var(--text-faint))] hover:text-[rgb(var(--text-muted))] transition">How to Write an Invoice</Link>
                <Link href="/guides/quote-template-uk" className="block text-xs text-[rgb(var(--text-faint))] hover:text-[rgb(var(--text-muted))] transition">Quote Template UK</Link>
                <Link href="/guides/invoice-template-uk" className="block text-xs text-[rgb(var(--text-faint))] hover:text-[rgb(var(--text-muted))] transition">Invoice Template UK</Link>
                <Link href="/guides/how-to-price-a-job" className="block text-xs text-[rgb(var(--text-faint))] hover:text-[rgb(var(--text-muted))] transition">How to Price a Job</Link>
                <Link href="/guides/vat-calculator-uk" className="block text-xs text-[rgb(var(--text-faint))] hover:text-[rgb(var(--text-muted))] transition">VAT Calculator</Link>
                <Link href="/guides/labour-rate-calculator-uk" className="block text-xs text-[rgb(var(--text-faint))] hover:text-[rgb(var(--text-muted))] transition">Labour Rate Calculator</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-widest mb-3">Product</p>
              <div className="space-y-2">
                <Link href="/demo" className="block text-xs text-[rgb(var(--text-faint))] hover:text-[rgb(var(--text-muted))] transition">Demo</Link>
                <Link href="/pricing" className="block text-xs text-[rgb(var(--text-faint))] hover:text-[rgb(var(--text-muted))] transition">Pricing</Link>
                <Link href="/auth?mode=signup" className="block text-xs text-[rgb(var(--text-faint))] hover:text-[rgb(var(--text-muted))] transition">Sign Up Free</Link>
                <Link href="/auth" className="block text-xs text-[rgb(var(--text-faint))] hover:text-[rgb(var(--text-muted))] transition">Log In</Link>
                <Link href="/guides" className="block text-xs text-[rgb(var(--text-faint))] hover:text-[rgb(var(--text-muted))] transition">Guides</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-widest mb-3">Company</p>
              <div className="space-y-2">
                <Link href="/contact" className="block text-xs text-[rgb(var(--text-faint))] hover:text-[rgb(var(--text-muted))] transition">Contact</Link>
                <Link href="/privacy" className="block text-xs text-[rgb(var(--text-faint))] hover:text-[rgb(var(--text-muted))] transition">Privacy Policy</Link>
                <Link href="/terms" className="block text-xs text-[rgb(var(--text-faint))] hover:text-[rgb(var(--text-muted))] transition">Terms & Conditions</Link>
                <Link href="/status" className="block text-xs text-[rgb(var(--text-faint))] hover:text-[rgb(var(--text-muted))] transition">Status</Link>
                <a href="mailto:hello@getjobquotes.uk" className="block text-xs text-[rgb(var(--text-faint))] hover:text-[rgb(var(--text-muted))] transition">hello@getjobquotes.uk</a>
              </div>
            </div>
          </div>
          <div className="border-t border-[rgb(var(--border))] pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-[rgb(var(--text-faint))]">© {new Date().getFullYear()} GetJobQuotes. Built for UK tradespeople.</p>
            <p className="text-xs text-[rgb(var(--text-faint))]">Free quoting and invoicing for UK trades</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
