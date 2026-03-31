import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import PublicFooter from "./PublicFooter";

interface TocItem { label: string; href: string; }
interface RelatedGuide { label: string; href: string; }

interface GuideLayoutProps {
  title: string;
  description: string;
  breadcrumb: string;
  lastUpdated?: string;
  toc?: TocItem[];
  related?: RelatedGuide[];
  children: ReactNode;
}

export default function GuideLayout({
  title, description, breadcrumb,
  lastUpdated = "March 2026",
  toc = [], related = [],
  children,
}: GuideLayoutProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-zinc-900 bg-black/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="text-base font-bold">
            <span className="text-green-400">Get</span>JobQuotes
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/guides" className="text-sm text-zinc-400 hover:text-white transition hidden sm:block">Guides</Link>
            <Link href="/auth" className="text-sm text-zinc-400 hover:text-white transition hidden sm:block">Log In</Link>
            <Link href="/auth?mode=signup"
              className="px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-500 text-white rounded-xl transition">
              Try Free
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-5 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-zinc-600 mb-8">
          <Link href="/" className="hover:text-zinc-400 transition">Home</Link>
          <span>/</span>
          <Link href="/guides" className="hover:text-zinc-400 transition">Guides</Link>
          <span>/</span>
          <span className="text-zinc-400">{breadcrumb}</span>
        </nav>

        <div className="lg:grid lg:grid-cols-[1fr_260px] lg:gap-12">
          {/* Main content */}
          <div>
            <div className="mb-8">
              <p className="text-xs text-green-400 font-semibold uppercase tracking-widest mb-2">Guide</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">{title}</h1>
              <p className="text-zinc-400 text-base leading-relaxed mb-3">{description}</p>
              <p className="text-xs text-zinc-600">Last updated: {lastUpdated}</p>
            </div>

            <div className="guide-content">
              {children}
            </div>

            {/* Bottom CTA */}
            <div className="mt-14 rounded-2xl border border-green-600/20 bg-green-600/5 p-8 text-center">
              <h3 className="text-xl font-bold mb-2">Ready to create professional quotes?</h3>
              <p className="text-zinc-400 text-sm mb-6 max-w-sm mx-auto">
                Join UK tradespeople using GetJobQuotes. Free to start, no card needed.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/auth?mode=signup"
                  className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-sm transition">
                  Start Free — No Card Needed
                </Link>
                <Link href="/demo"
                  className="px-6 py-3 border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-semibold rounded-xl text-sm transition">
                  Try the Demo →
                </Link>
              </div>
            </div>

            {/* Related guides */}
            {related.length > 0 && (
              <div className="mt-10">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">Related Guides</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {related.map(r => (
                    <Link key={r.href} href={r.href}
                      className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-300 hover:text-green-400 hover:border-green-600/30 transition">
                      {r.label} →
                    </Link>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3 mt-3">
                  <Link href="/demo" className="text-xs text-zinc-600 hover:text-green-400 transition">→ Try the Demo</Link>
                  <Link href="/templates/quote-template-uk" className="text-xs text-zinc-600 hover:text-green-400 transition">→ Quote Template</Link>
                  <Link href="/templates/invoice-template-uk" className="text-xs text-zinc-600 hover:text-green-400 transition">→ Invoice Template</Link>
                  <Link href="/pricing" className="text-xs text-zinc-600 hover:text-green-400 transition">→ Pricing</Link>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar TOC */}
          {toc.length > 0 && (
            <div className="hidden lg:block">
              <div className="sticky top-24 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Contents</p>
                <nav className="space-y-2">
                  {toc.map(item => (
                    <a key={item.href} href={item.href}
                      className="block text-xs text-zinc-500 hover:text-green-400 transition leading-relaxed">
                      {item.label}
                    </a>
                  ))}
                </nav>
                <div className="mt-5 pt-5 border-t border-zinc-800">
                  <Link href="/auth?mode=signup"
                    className="block w-full py-2.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-xl text-center transition">
                    Try Free →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <PublicFooter dark={true} />
    </div>
  );
}
