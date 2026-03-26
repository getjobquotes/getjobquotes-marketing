import Link from "next/link";
import type { ReactNode } from "react";

interface GuideLayoutProps {
  title: string;
  description: string;
  breadcrumb: string;
  children: ReactNode;
}

export default function GuideLayout({ title, description, breadcrumb, children }: GuideLayoutProps) {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Nav */}
      <nav className="border-b border-zinc-200 px-5 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-base font-bold">
            <span className="text-green-600">Get</span>JobQuotes
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/guides" className="text-sm text-zinc-500 hover:text-zinc-900">Guides</Link>
            <Link href="/auth" className="text-sm text-zinc-500 hover:text-zinc-900">Log In</Link>
            <Link href="/auth?mode=signup"
              className="px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-500 text-white rounded-lg transition">
              Try Free
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-5 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
          <Link href="/" className="hover:text-zinc-600">Home</Link>
          <span>/</span>
          <Link href="/guides" className="hover:text-zinc-600">Guides</Link>
          <span>/</span>
          <span className="text-zinc-600">{breadcrumb}</span>
        </nav>

        <article className="prose prose-zinc max-w-none">
          {children}
        </article>

        {/* CTA */}
        <div className="mt-12 rounded-2xl bg-green-50 border border-green-200 p-8 text-center">
          <h3 className="text-xl font-bold text-zinc-900 mb-2">Ready to create professional quotes?</h3>
          <p className="text-zinc-500 text-sm mb-6">
            Join UK tradespeople already using GetJobQuotes. Free to start, no card needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth?mode=signup"
              className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-sm transition">
              Start Free — No Card Needed
            </Link>
            <Link href="/demo"
              className="px-6 py-3 border border-zinc-300 hover:border-zinc-400 text-zinc-700 font-semibold rounded-xl text-sm transition">
              Try the Demo First →
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 mt-16">
      <div className="max-w-5xl mx-auto px-5 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          <div>
            <p className="text-sm font-bold text-zinc-900 mb-3">
              <span className="text-green-600">Get</span>JobQuotes
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
                <Link key={href} href={href} className="block text-xs text-zinc-500 hover:text-zinc-900 transition">
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
                <Link key={href} href={href} className="block text-xs text-zinc-500 hover:text-zinc-900 transition">
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
                <Link key={href} href={href} className="block text-xs text-zinc-500 hover:text-zinc-900 transition">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-zinc-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-zinc-400">© {new Date().getFullYear()} GetJobQuotes. Built for UK tradespeople.</p>
          <p className="text-xs text-zinc-400">
            <a href="mailto:hello@getjobquotes.uk" className="hover:text-zinc-600">hello@getjobquotes.uk</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
