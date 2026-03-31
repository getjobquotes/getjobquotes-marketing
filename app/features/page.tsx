import type { Metadata } from "next";
import Link from "next/link";
import PublicFooter from "@/components/PublicFooter";

export const metadata: Metadata = {
  title: "Features – Professional Quoting for UK Tradespeople",
  description: "Everything GetJobQuotes offers: PDF quotes, invoices, customer management, online acceptance, WhatsApp sharing, trade calculator and more.",
};

const features = [
  { icon: "📋", title: "Professional Quote PDFs", desc: "Branded PDFs with your logo, signature and line items. Generated in seconds." },
  { icon: "🔄", title: "Convert Quote to Invoice", desc: "Turn any approved quote into an invoice in one click. No retyping." },
  { icon: "👥", title: "Customer Management", desc: "Save client details. Fill new quotes in seconds on repeat jobs." },
  { icon: "✍️", title: "Online Acceptance", desc: "Clients accept quotes via a link. You get notified instantly." },
  { icon: "📱", title: "Mobile First", desc: "Built for tradespeople on the go. Works perfectly on any phone." },
  { icon: "💬", title: "WhatsApp Sharing", desc: "Send quote links directly via WhatsApp. No printing needed." },
  { icon: "🧮", title: "Trade Calculator", desc: "Markup, VAT, day rates and materials — built into every page." },
  { icon: "📊", title: "Track Everything", desc: "See all quotes and invoices. Mark as paid. Know what is outstanding." },
  { icon: "💷", title: "VAT Ready", desc: "Toggle VAT on or off per quote. Subtotals and totals calculated automatically." },
  { icon: "🔒", title: "Secure and Private", desc: "Your data is protected. We never share your client information." },
  { icon: "🎨", title: "Your Branding", desc: "Add your logo and signature. Every quote looks like you made it." },
  { icon: "📧", title: "Email Notifications", desc: "Get notified when a client views or accepts your quote." },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="sticky top-0 z-50 border-b border-zinc-900 bg-black/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="text-base font-bold"><span className="text-green-400">Get</span>JobQuotes</Link>
          <div className="flex items-center gap-3">
            <Link href="/pricing" className="text-sm text-zinc-400 hover:text-white transition hidden sm:block">Pricing</Link>
            <Link href="/auth?mode=signup" className="px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-500 text-white rounded-xl transition">Try Free</Link>
          </div>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto px-5 py-16">
        <div className="text-center mb-14">
          <p className="text-xs text-green-400 font-semibold uppercase tracking-widest mb-3">Features</p>
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">Everything you need to quote like a pro</h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto mb-8">Built specifically for UK tradespeople. No bloat. Just the tools that actually get used.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth?mode=signup" className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-sm transition">Start Free — No Card Needed</Link>
            <Link href="/demo" className="px-6 py-3 border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-semibold rounded-xl text-sm transition">Try the Demo →</Link>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {features.map(f => (
            <div key={f.title} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-green-600/30 transition group">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h2 className="text-base font-bold mb-2 group-hover:text-green-400 transition">{f.title}</h2>
              <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="rounded-3xl border border-green-600/20 bg-green-600/5 p-10 text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to get started?</h2>
          <p className="text-zinc-400 text-sm mb-6">Free plan available. No credit card required.</p>
          <Link href="/auth?mode=signup" className="inline-block px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-2xl text-sm transition">Create Free Account →</Link>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
