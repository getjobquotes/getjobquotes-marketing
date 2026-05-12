
import type { Metadata } from "next";
import Link from "next/link";
import PublicFooter from "@/components/PublicFooter";

export const metadata: Metadata = {
  title: "About GetJobQuotes – Built for UK Tradespeople",
  description: "GetJobQuotes is an early-stage quoting tool built for UK tradespeople. Here is what it does, why it exists, and what we are still working on.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="sticky top-0 z-50 border-b border-zinc-900 bg-black/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="text-base font-bold">
            <span className="text-green-400">Get</span>JobQuotes
          </Link>
          <Link href="/auth?mode=signup"
            className="px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-500 text-white rounded-xl transition">
            Try Free
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-5 py-16">
        <p className="text-xs text-green-400 font-semibold uppercase tracking-widest mb-3">About</p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-8">What GetJobQuotes is</h1>

        <div className="space-y-8 text-zinc-400 text-sm leading-relaxed">

          <div>
            <h2 className="text-base font-bold text-white mb-2">Why this exists</h2>
            <p>
              A lot of tradespeople still send quotes by WhatsApp message, scribbled on paper,
              or copied from an old Word document. It works — but it does not look great,
              and clients sometimes do not take it seriously.
            </p>
            <p className="mt-2">
              GetJobQuotes is a simple tool to fix that. Type in your line items, download a PDF,
              send the link. That is basically it.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-white mb-2">Who it is for</h2>
            <ul className="space-y-1.5">
              {["Sole traders and small trade businesses","Plumbers, electricians, builders, decorators, joiners","Anyone who currently quotes by message, note or spreadsheet","UK-based — VAT and GBP built in"].map(i => (
                <li key={i} className="flex gap-2"><span className="text-green-400 shrink-0">→</span>{i}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-base font-bold text-white mb-2">What it does well</h2>
            <ul className="space-y-1.5">
              {[
                "Creates a professional-looking PDF quote quickly",
                "Lets you save customers so you are not retyping details",
                "Handles VAT correctly — toggle on or off per quote",
                "Works on your phone without needing an app download",
                "Lets clients accept quotes via a link without logging in",
              ].map(i => (
                <li key={i} className="flex gap-2"><span className="text-green-400 shrink-0">✓</span>{i}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-base font-bold text-white mb-2">What is still being improved</h2>
            <ul className="space-y-1.5">
              {[
                "Email sending — currently you share a link, not send directly from the app",
                "Invoice reminders — not built yet",
                "Job photos — not built yet",
                "The design in some areas is still rough",
                "Mobile experience needs more polish",
              ].map(i => (
                <li key={i} className="flex gap-2"><span className="text-zinc-600 shrink-0">–</span>{i}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-base font-bold text-white mb-2">Is it free?</h2>
            <p>
              Yes, completely free right now. We are in an early stage and want real
              tradespeople using it before we think about charging anything.
              If that changes, we will be upfront about it well in advance.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-white mb-2">Feedback welcome</h2>
            <p>
              If something is broken, confusing, or missing — we want to know.
              Email <a href="mailto:hello@getjobquotes.uk" className="text-green-400 hover:text-green-300">
                hello@getjobquotes.uk
              </a> and we will actually read it and reply.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row gap-3">
          <Link href="/auth?mode=signup"
            className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-sm transition text-center">
            Try it free
          </Link>
          <Link href="/demo"
            className="px-6 py-3 border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-semibold rounded-xl text-sm transition text-center">
            See the demo first
          </Link>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
