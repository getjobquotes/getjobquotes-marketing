import type { ReactNode } from "react";
import Link from "next/link";
import PublicFooter from "./PublicFooter";

interface HelpLayoutProps {
  title: string;
  description: string;
  breadcrumb: string;
  related?: { label: string; href: string }[];
  children: ReactNode;
}

const helpNav = [
  { label: "Getting Started",  href: "/help/getting-started" },
  { label: "Quotes",           href: "/help/quotes" },
  { label: "Invoices",         href: "/help/invoices" },
  { label: "Customers",        href: "/help/customers" },
  { label: "Calculator",       href: "/help/calculator" },
];

export default function HelpLayout({ title, description, breadcrumb, related = [], children }: HelpLayoutProps) {
  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--text))]">
      <nav className="sticky top-0 z-50 border-b border-[rgb(var(--border))] bg-black/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="text-base font-bold">
            <span className="text-green-400">Get</span>JobQuotes
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/help" className="text-sm text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] transition hidden sm:block">Help</Link>
            <Link href="/auth?mode=signup"
              className="px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-500 text-[rgb(var(--text))] rounded-xl transition">
              Try Free
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-5 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[rgb(var(--text-faint))] mb-8">
          <Link href="/" className="hover:text-[rgb(var(--text-muted))]">Home</Link>
          <span>/</span>
          <Link href="/help" className="hover:text-[rgb(var(--text-muted))]">Help</Link>
          <span>/</span>
          <span className="text-[rgb(var(--text-muted))]">{breadcrumb}</span>
        </nav>

        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-12">
          {/* Help sidebar nav */}
          <div className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface)/0.5)] p-4">
              <p className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-widest mb-3">Help Topics</p>
              <nav className="space-y-1">
                {helpNav.map(item => (
                  <Link key={item.href} href={item.href}
                    className="block px-3 py-2 rounded-lg text-sm text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] hover:bg-[rgb(var(--surface2))] transition">
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-4 pt-4 border-t border-[rgb(var(--border))]">
                <a href="mailto:hello@getjobquotes.uk"
                  className="block text-xs text-[rgb(var(--text-muted))] hover:text-green-400 transition">
                  📧 Email support
                </a>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="mb-8">
              <p className="text-xs text-green-400 font-semibold uppercase tracking-widest mb-2">Help Centre</p>
              <h1 className="text-3xl font-bold text-[rgb(var(--text))] mb-3">{title}</h1>
              <p className="text-[rgb(var(--text-muted))] text-base leading-relaxed">{description}</p>
            </div>

            <div className="guide-content">
              {children}
            </div>

            {/* Related articles */}
            {related.length > 0 && (
              <div className="mt-10 pt-8 border-t border-[rgb(var(--border))]">
                <h3 className="text-sm font-semibold text-[rgb(var(--text-muted))] uppercase tracking-widest mb-4">Related Articles</h3>
                <div className="space-y-2">
                  {related.map(r => (
                    <Link key={r.href} href={r.href}
                      className="flex items-center gap-2 text-sm text-[rgb(var(--text-muted))] hover:text-green-400 transition">
                      <span className="text-[rgb(var(--text-faint))]">→</span>{r.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Contact support */}
            <div className="mt-10 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface)/0.5)] p-6">
              <p className="text-sm font-semibold text-[rgb(var(--text))] mb-1">Still need help?</p>
              <p className="text-xs text-[rgb(var(--text-muted))] mb-3">Our team usually responds within a few hours.</p>
              <a href="mailto:hello@getjobquotes.uk"
                className="inline-block px-4 py-2.5 bg-green-600 hover:bg-green-500 text-[rgb(var(--text))] text-xs font-semibold rounded-xl transition">
                Email hello@getjobquotes.uk
              </a>
            </div>
          </div>
        </div>
      </div>

      <PublicFooter dark={true} />
    </div>
  );
}
