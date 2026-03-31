import type { Metadata } from "next";
import Link from "next/link";
import PublicFooter from "@/components/PublicFooter";

export const metadata: Metadata = {
  title: "Cookie Policy – GetJobQuotes",
  description: "How GetJobQuotes uses cookies and similar technologies.",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="sticky top-0 z-50 border-b border-zinc-900 bg-black/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="text-base font-bold"><span className="text-green-400">Get</span>JobQuotes</Link>
          <Link href="/auth?mode=signup" className="px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-500 text-white rounded-xl transition">Try Free</Link>
        </div>
      </nav>
      <div className="max-w-2xl mx-auto px-5 py-16">
        <p className="text-xs text-green-400 font-semibold uppercase tracking-widest mb-2">Legal</p>
        <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
        <p className="text-zinc-600 text-xs mb-10">Last updated: March 2026</p>
        <div className="guide-content space-y-6">
          <p className="text-zinc-400">This Cookie Policy explains how GetJobQuotes (&quot;we&quot;, &quot;us&quot;) uses cookies and similar technologies when you visit getjobquotes.uk.</p>
          <h2>What are cookies?</h2>
          <p>Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and improve your experience.</p>
          <h2>How we use cookies</h2>
          <h3>Essential cookies</h3>
          <p>These are required for the site to function. They include your login session cookies managed by Supabase. You cannot opt out of essential cookies.</p>
          <h3>Analytics cookies</h3>
          <p>We use Google Analytics (GA4) to understand how visitors use our site. This helps us improve the product. These cookies are only set if you accept cookies.</p>
          <h3>Advertising cookies</h3>
          <p>We use Google AdSense to show relevant ads on our public pages (landing page, guides, help pages). AdSense uses cookies to serve relevant ads. These are only set if you accept cookies.</p>
          <h2>Managing cookies</h2>
          <p>When you first visit the site, you can choose to accept all cookies or essential only. You can change your preference at any time by clearing your browser data or using the cookie banner.</p>
          <h2>Contact</h2>
          <p>Questions about our cookie use? Email us at <a href="mailto:hello@getjobquotes.uk">hello@getjobquotes.uk</a>.</p>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
