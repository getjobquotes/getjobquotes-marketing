import Link from "next/link";
import type { ReactNode } from "next/dist/shared/lib/utils";

interface GuideLayoutProps {
  title: string;
  description: string;
  breadcrumb: string;
  children: ReactNode;
}

export default function GuideLayout({ title, description, breadcrumb, children }: GuideLayoutProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-zinc-900 bg-black/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="text-base font-bold">
            <span className="text-green-400">Get</span>JobQuotes
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/guides" className="text-sm text-zinc-400 hover:text-white transition">Guides</Link>
            <Link href="/auth" className="text-sm text-zinc-400 hover:text-white transition">Log In</Link>
            <Link href="/auth?mode=signup"
              className="px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-500 text-white rounded-xl transition">
              Try Free
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-5 py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-zinc-600 mb-8">
          <Link href="/" className="hover:text-zinc-400 transition">Home</Link>
          <span>/</span>
          <Link href="/guides" className="hover:text-zinc-400 transition">Guides</Link>
          <span>/</span>
          <span className="text-zinc-400">{breadcrumb}</span>
        </nav>

        {/* Article content */}
        <div className="guide-content">
          {children}
        </div>

        {/* CTA */}
        <div className="mt-14 rounded-2xl border border-green-600/20 bg-green-600/5 p-8 text-center">
          <h3 className="text-xl font-bold mb-2">Ready to create professional quotes?</h3>
          <p className="text-zinc-400 text-sm mb-6 max-w-sm mx-auto">
            Join UK tradespeople already using GetJobQuotes. Free to start, no card needed.
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

export function PublicFooter() {
  return (
    <footer className="border-t border-zinc-900 px-5 py-12 mt-8">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          <div>
            <p className="text-sm font-bold mb-3">
              <span className="text-green-400">Get</span>JobQuotes
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Professional quotes and invoices for UK tradespeople.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Guides</p>
            <div className="space-y-2">
              {[
                ["How to Write a Quote", "/guides/how-to-write-a-quote-uk"],
                ["How to Write an Invoice", "/guides/how-to-write-an-invoice-uk"],
                ["Quote Template UK", "/guides/quote-template-uk"],
                ["Invoice Template UK", "/guides/invoice-template-uk"],
                ["How to Price a Job", "/guides/how-to-price-a-job"],
                ["VAT Calculator", "/guides/vat-calculator-uk"],
                ["Labour Rate Calculator", "/guides/labour-rate-calculator-uk"],
              ].map(([label, href]) => (
                <Link key={href} href={href} className="block text-xs text-zinc-600 hover:text-zinc-400 transition">
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Product</p>
            <div className="space-y-2">
              {[
                ["Demo", "/demo"],
                ["Pricing", "/pricing"],
                ["Sign Up Free", "/auth?mode=signup"],
                ["Log In", "/auth"],
              ].map(([label, href]) => (
                <Link key={href} href={href} className="block text-xs text-zinc-600 hover:text-zinc-400 transition">
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Company</p>
            <div className="space-y-2">
              {[
                ["Contact", "/contact"],
                ["Privacy Policy", "/privacy"],
                ["Terms & Conditions", "/terms"],
                ["Status", "/status"],
              ].map(([label, href]) => (
                <Link key={href} href={href} className="block text-xs text-zinc-600 hover:text-zinc-400 transition">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-zinc-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-zinc-700">© {new Date().getFullYear()} GetJobQuotes. Built for UK tradespeople.</p>
          <a href="mailto:hello@getjobquotes.uk" className="text-xs text-zinc-700 hover:text-zinc-500 transition">
            hello@getjobquotes.uk
          </a>
        </div>
      </div>
    </footer>
  );
}
