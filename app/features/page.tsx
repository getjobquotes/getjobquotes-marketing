
import type { Metadata } from "next";
import Link from "next/link";
import PublicFooter from "@/components/PublicFooter";

export const metadata: Metadata = {
  title: "Features – What GetJobQuotes Does | GetJobQuotes",
  description: "A plain-English list of what GetJobQuotes can do for UK tradespeople. Quotes, invoices, PDF downloads, customer saving, VAT, and more.",
};

const features = [
  { icon: "📋", title: "Quote builder", desc: "Add line items for labour, materials and anything else. The total is calculated automatically. Toggle VAT on or off." },
  { icon: "🧾", title: "Invoice builder", desc: "Same as quotes but labelled as invoices. Convert a quote to invoice in one click without retyping anything." },
  { icon: "📄", title: "PDF download", desc: "Download a professional-looking PDF with your business name, logo and signature. No design skills needed." },
  { icon: "👥", title: "Customer saving", desc: "Save client details once. On future quotes, pick their name from a dropdown and the fields fill in automatically." },
  { icon: "🔗", title: "Shareable quote link", desc: "Every quote gets a link. Send it by WhatsApp, email or text. The client can view and accept it without logging in." },
  { icon: "✅", title: "Online acceptance", desc: "Clients can accept quotes online. You see the status update on your dashboard." },
  { icon: "🧮", title: "Trade calculator", desc: "Built-in calculator with tabs for markup, VAT, day rates and materials. Available on every page." },
  { icon: "💷", title: "UK VAT support", desc: "Toggle VAT per quote. Subtotal, VAT amount and total shown separately on the PDF." },
  { icon: "📱", title: "Works on your phone", desc: "No app to download. Open the browser on your phone and it works. Not perfect on mobile yet but usable." },
  { icon: "🔒", title: "Your data stays yours", desc: "Quotes and customer details are only visible to you. Nothing is shared." },
];

const notYet = [
  "Sending invoices directly from the app by email",
  "Payment reminders when invoices are overdue",
  "Attaching job photos to quotes",
  "Multiple users on one account",
  "Integrations with accounting software",
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="sticky top-0 z-50 border-b border-zinc-900 bg-black/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="text-base font-bold"><span className="text-green-400">Get</span>JobQuotes</Link>
          <div className="flex items-center gap-3">
            <Link href="/pricing" className="text-sm text-zinc-400 hover:text-white transition hidden sm:block">Pricing</Link>
            <Link href="/auth?mode=signup"
              className="px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-500 text-white rounded-xl transition">
              Try Free
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-5 py-16">
        <div className="mb-12">
          <p className="text-xs text-green-400 font-semibold uppercase tracking-widest mb-3">Features</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">What GetJobQuotes does</h1>
          <p className="text-zinc-400 text-base max-w-xl">
            A plain-English list of what is built and working right now.
            We have also listed what is not ready yet so you know what to expect.
          </p>
        </div>

        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">What works now</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-14">
          {features.map(f => (
            <div key={f.title} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="text-sm font-bold text-white mb-1">{f.title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 mb-12">
          <h2 className="text-sm font-bold text-white mb-4">Not built yet</h2>
          <div className="space-y-2">
            {notYet.map(n => (
              <div key={n} className="flex gap-2 text-sm text-zinc-500">
                <span className="text-zinc-700 shrink-0">–</span>{n}
              </div>
            ))}
          </div>
          <p className="text-xs text-zinc-600 mt-4">
            If any of these are important to you, let us know:{" "}
            <a href="mailto:hello@getjobquotes.uk" className="text-green-400 hover:text-green-300">
              hello@getjobquotes.uk
            </a>
          </p>
        </div>

        <div className="rounded-3xl border border-green-600/20 bg-green-600/5 p-8 text-center">
          <h2 className="text-xl font-bold mb-2">It is free to try</h2>
          <p className="text-zinc-400 text-sm mb-6">No card. No limit. Create an account and try it on a real job.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth?mode=signup"
              className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-sm transition">
              Create free account
            </Link>
            <Link href="/demo"
              className="px-6 py-3 border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-semibold rounded-xl text-sm transition">
              Try the demo first →
            </Link>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
