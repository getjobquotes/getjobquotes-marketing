import type { Metadata } from "next";
import Link from "next/link";
import PublicFooter from "@/components/PublicFooter";

export const metadata: Metadata = {
  title: "Free Quote Template UK – Download for Tradespeople | GetJobQuotes",
  description: "Free professional quote template for UK tradespeople. Use our online tool or download a PDF. No sign-up required for the demo.",
};

export default function QuoteTemplatePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="sticky top-0 z-50 border-b border-zinc-900 bg-black/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="text-base font-bold"><span className="text-green-400">Get</span>JobQuotes</Link>
          <Link href="/auth?mode=signup" className="px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-500 text-white rounded-xl transition">Try Free</Link>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-5 py-16">
        <nav className="flex items-center gap-2 text-xs text-zinc-600 mb-8">
          <Link href="/" className="hover:text-zinc-400">Home</Link><span>/</span>
          <span className="text-zinc-400">Quote Template UK</span>
        </nav>
        <p className="text-xs text-green-400 font-semibold uppercase tracking-widest mb-2">Free Template</p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Free Quote Template UK</h1>
        <p className="text-zinc-400 text-lg mb-8">A professional quote template for UK tradespeople. Use our free online builder or try the demo — no account needed.</p>
        <div className="flex flex-col sm:flex-row gap-3 mb-12">
          <Link href="/demo" className="px-6 py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-sm transition text-center">Try Free Quote Builder →</Link>
          <Link href="/auth?mode=signup" className="px-6 py-4 border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-semibold rounded-xl text-sm transition text-center">Create Free Account</Link>
        </div>
        <div className="guide-content">
          <h2>What should a quote template include?</h2>
          <ul>
            <li>Your business name, logo and contact details</li>
            <li>Client name and address</li>
            <li>Quote reference number and date</li>
            <li>Expiry date (usually 30 days)</li>
            <li>Detailed line items — labour, materials, other costs</li>
            <li>Subtotal, VAT (if applicable) and total</li>
            <li>Payment terms and conditions</li>
            <li>Your signature</li>
          </ul>
          <h2>Why use GetJobQuotes instead of a Word template?</h2>
          <p>A Word or Excel template requires you to manually update every field, do the maths yourself and then convert to PDF. GetJobQuotes does all of this automatically — in under 2 minutes, from your phone.</p>
          <h2>Related guides</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          {[
            ["How to Write a Quote (UK)", "/guides/how-to-write-a-quote-uk"],
            ["Invoice Template UK", "/templates/invoice-template-uk"],
            ["How to Price a Job", "/guides/how-to-price-a-job"],
            ["VAT Calculator", "/guides/vat-calculator-uk"],
          ].map(([l, h]) => (
            <Link key={h} href={h} className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-300 hover:text-green-400 hover:border-green-600/30 transition">{l} →</Link>
          ))}
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
