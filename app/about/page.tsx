import type { Metadata } from "next";
import Link from "next/link";
import PublicFooter from "@/components/PublicFooter";

export const metadata: Metadata = {
  title: "About GetJobQuotes – Built for UK Tradespeople",
  description: "GetJobQuotes is a quoting and invoicing tool built specifically for UK tradespeople. Our mission is to make professional quoting fast and simple.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="sticky top-0 z-50 border-b border-zinc-900 bg-black/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="text-base font-bold"><span className="text-green-400">Get</span>JobQuotes</Link>
          <Link href="/auth?mode=signup" className="px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-500 text-white rounded-xl transition">Try Free</Link>
        </div>
      </nav>
      <div className="max-w-2xl mx-auto px-5 py-16">
        <p className="text-xs text-green-400 font-semibold uppercase tracking-widest mb-3">About</p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-6">Built for UK tradespeople</h1>
        <div className="guide-content space-y-4">
          <p className="text-zinc-300 text-lg leading-relaxed">GetJobQuotes was built because UK tradespeople deserve better than writing quotes on paper or spending hours in spreadsheets.</p>
          <p className="text-zinc-400 leading-relaxed">Our mission is simple: make it possible for any tradesperson — plumber, electrician, builder, decorator — to create a professional quote in under 2 minutes, from their phone, on site.</p>
          <p className="text-zinc-400 leading-relaxed">We are a small, independent team building tools we wish existed when we started. Every feature is chosen because real tradespeople asked for it.</p>
          <h2 className="text-xl font-bold text-white mt-8 mb-3">Our principles</h2>
          <ul className="space-y-3">
            {["Simple — no unnecessary complexity","Fast — everything should take seconds, not minutes","Mobile first — built for phones used on site","Honest — free plan that actually works, Pro that is worth paying for","UK focused — VAT, GBP, UK invoice requirements built in"].map(p => (
              <li key={p} className="flex gap-3 text-zinc-400 text-sm"><span className="text-green-400 mt-0.5">✓</span>{p}</li>
            ))}
          </ul>
          <h2 className="text-xl font-bold text-white mt-8 mb-3">Get in touch</h2>
          <p className="text-zinc-400">We read every email. Reach us at{" "}<a href="mailto:hello@getjobquotes.uk" className="text-green-400 hover:text-green-300">hello@getjobquotes.uk</a>.</p>
        </div>
        <div className="mt-12 flex flex-col sm:flex-row gap-3">
          <Link href="/auth?mode=signup" className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-sm transition text-center">Start Free</Link>
          <Link href="/demo" className="px-6 py-3 border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-semibold rounded-xl text-sm transition text-center">Try the Demo</Link>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
