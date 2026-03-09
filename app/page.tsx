import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 border-b border-white/5 backdrop-blur-sm bg-black/80">
        <span className="text-lg font-bold tracking-tight">
          <span className="text-green-400">Get</span>JobQuotes
        </span>
        <div className="flex items-center gap-3">
          <Link href="/auth?mode=login"
            className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition">
            Log In
          </Link>
          <Link href="/auth?mode=signup"
            className="px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-500 rounded-lg transition">
            Start Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center pt-20">

        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-green-600/5 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            Built for UK tradespeople
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold leading-tight tracking-tight mb-6">
            Quotes & Invoices
            <br />
            <span className="text-green-400">in under 2 minutes</span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Stop wasting time on paperwork. Create professional quotes, convert them to invoices, and download clean PDFs instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth?mode=signup"
              className="w-full sm:w-auto px-8 py-4 text-base font-bold bg-green-600 hover:bg-green-500 rounded-xl transition transform hover:scale-105">
              Start Free — No Card Needed
            </Link>
            <Link href="/auth?mode=login"
              className="w-full sm:w-auto px-8 py-4 text-base font-semibold border border-zinc-700 hover:border-zinc-500 rounded-xl transition text-zinc-300 hover:text-white">
              Log In
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-600">
          <span className="text-xs">scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-zinc-600 to-transparent" />
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
          Everything you need
        </h2>
        <p className="text-zinc-400 text-center mb-16 max-w-lg mx-auto">
          Designed for plumbers, electricians, builders, and every trade in between.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: "📋",
              title: "Professional Quotes",
              desc: "Fill in a simple form and get a clean, branded PDF quote ready to send in seconds.",
            },
            {
              icon: "🔄",
              title: "Convert to Invoice",
              desc: "Turn any quote into an invoice with one click. No retyping, no mistakes.",
            },
            {
              icon: "📄",
              title: "Download PDF",
              desc: "Clean, professional PDFs your clients will trust. Choose from multiple templates.",
            },
          ].map((f) => (
            <div key={f.title}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 hover:border-green-600/40 transition group">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-green-400 transition">{f.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-24 bg-zinc-950 border-y border-zinc-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
            How it works
          </h2>
          <div className="space-y-8">
            {[
              { step: "01", title: "Sign up free", desc: "Create your account in seconds with Google or email." },
              { step: "02", title: "Fill in your quote", desc: "Enter job details, costs, and VAT. Takes under 2 minutes." },
              { step: "03", title: "Download your PDF", desc: "Get a professional PDF instantly. Send it to your client." },
              { step: "04", title: "Convert to invoice", desc: "When the job is done, convert your quote to an invoice with one click." },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-6">
                <span className="text-4xl font-bold text-green-500/30 shrink-0 w-12">{s.step}</span>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{s.title}</h3>
                  <p className="text-zinc-400 text-sm">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-zinc-400 mb-8">Free to use. No credit card required.</p>
          <Link href="/auth?mode=signup"
            className="inline-block px-10 py-4 text-lg font-bold bg-green-600 hover:bg-green-500 rounded-xl transition transform hover:scale-105">
            Create Your First Quote
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 px-8 py-6 flex items-center justify-between text-xs text-zinc-600">
        <span><span className="text-green-400">Get</span>JobQuotes.uk</span>
        <span>Built for UK trades</span>
      </footer>

    </main>
  );
}
