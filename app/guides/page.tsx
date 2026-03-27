import Link from "next/link";
import type { Metadata } from "next";
import { PublicFooter } from "@/components/GuideLayout";
import GuideAdBanner from "@/components/GuideAdBanner";

export const metadata: Metadata = {
  title: "Free Guides for UK Tradespeople | GetJobQuotes",
  description: "Free guides on quoting, invoicing, pricing jobs and VAT for UK tradespeople. Plumbers, electricians, builders and more.",
};

const guides = [
  {
    slug: "how-to-write-a-quote-uk",
    title: "How to Write a Quote (UK)",
    desc: "Step-by-step guide to writing professional quotes that win jobs. What to include, how to price and how to send.",
    emoji: "📋",
    time: "5 min read",
  },
  {
    slug: "how-to-write-an-invoice-uk",
    title: "How to Write an Invoice (UK)",
    desc: "Everything you need to know about writing legal, professional invoices as a UK tradesperson or sole trader.",
    emoji: "🧾",
    time: "5 min read",
  },
  {
    slug: "quote-template-uk",
    title: "Quote Template UK (Free)",
    desc: "Free quote template for UK tradespeople. Download or use our online tool to create professional quotes instantly.",
    emoji: "📄",
    time: "3 min read",
  },
  {
    slug: "invoice-template-uk",
    title: "Invoice Template UK (Free)",
    desc: "Free invoice template for UK sole traders and tradespeople. HMRC compliant and professionally designed.",
    emoji: "💷",
    time: "3 min read",
  },
  {
    slug: "how-to-price-a-job",
    title: "How to Price a Job as a Tradesperson",
    desc: "How to calculate your day rate, price materials, add markup and quote profitably without losing jobs.",
    emoji: "🧮",
    time: "7 min read",
  },
  {
    slug: "labour-rate-calculator-uk",
    title: "Labour Rate Calculator UK",
    desc: "How to calculate your hourly and day rate as a UK tradesperson. Includes a free calculator tool.",
    emoji: "⚒️",
    time: "4 min read",
  },
  {
    slug: "vat-calculator-uk",
    title: "VAT Calculator UK (Free)",
    desc: "Add or remove 20% UK VAT from any price instantly. Includes a guide on VAT for tradespeople.",
    emoji: "📊",
    time: "3 min read",
  },
];

export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="sticky top-0 z-50 border-b border-zinc-900 bg-black/95 backdrop-blur-sm px-5">
        <div className="max-w-5xl mx-auto h-14 flex items-center justify-between">
          <Link href="/" className="text-base font-bold">
            <span className="text-green-600">Get</span>JobQuotes
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

      <div className="max-w-5xl mx-auto px-5 py-14">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-white">Free Guides for UK Tradespeople</h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Everything you need to know about quoting, invoicing and pricing jobs professionally.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {guides.map(g => (
            <Link key={g.slug} href={`/guides/${g.slug}`}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:border-green-600/40 p-6 transition group">
              <div className="text-3xl mb-3">{g.emoji}</div>
              <h2 className="text-base font-bold mb-2 group-hover:text-green-400 transition text-white">{g.title}</h2>
              <p className="text-sm text-zinc-400 leading-relaxed mb-3">{g.desc}</p>
              <span className="text-xs text-zinc-600">{g.time}</span>
            </Link>
          ))}
        </div>

        <GuideAdBanner className="rounded-xl overflow-hidden" />

        <div className="mt-14 rounded-2xl bg-green-600/5 border border-green-600/20 p-8 text-center">
          <h2 className="text-xl font-bold mb-2 text-white">Create professional quotes in under 2 minutes</h2>
          <p className="text-zinc-500 text-sm mb-6">
            Free quoting and invoicing tool built for UK tradespeople.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth?mode=signup"
              className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-sm transition">
              Start Free — No Card Needed
            </Link>
            <Link href="/demo"
              className="px-6 py-3 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-semibold rounded-xl text-sm transition">
              Try the Demo →
            </Link>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
