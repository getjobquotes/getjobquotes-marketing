import type { Metadata } from "next";
import Link from "next/link";
import PublicFooter from "@/components/PublicFooter";

export const metadata: Metadata = {
  title: "Free Invoice Template UK – For Sole Traders & Tradespeople | GetJobQuotes",
  description: "Free HMRC-compliant invoice template for UK sole traders and tradespeople. Use our online invoice tool or download a PDF.",
};

export default function InvoiceTemplatePage() {
  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--text))]">
      <nav className="sticky top-0 z-50 border-b border-[rgb(var(--border))] bg-black/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="text-base font-bold"><span className="text-green-400">Get</span>JobQuotes</Link>
          <Link href="/auth?mode=signup" className="px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-500 text-[rgb(var(--text))] rounded-xl transition">Try Free</Link>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-5 py-16">
        <nav className="flex items-center gap-2 text-xs text-[rgb(var(--text-faint))] mb-8">
          <Link href="/" className="hover:text-[rgb(var(--text-muted))]">Home</Link><span>/</span>
          <span className="text-[rgb(var(--text-muted))]">Invoice Template UK</span>
        </nav>
        <p className="text-xs text-green-400 font-semibold uppercase tracking-widest mb-2">Free Template</p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Free Invoice Template UK</h1>
        <p className="text-[rgb(var(--text-muted))] text-lg mb-8">HMRC-compliant invoice template for UK sole traders and tradespeople. Create and download a professional invoice in minutes.</p>
        <div className="flex flex-col sm:flex-row gap-3 mb-12">
          <Link href="/demo" className="px-6 py-4 bg-green-600 hover:bg-green-500 text-[rgb(var(--text))] font-bold rounded-xl text-sm transition text-center">Create Free Invoice →</Link>
          <Link href="/auth?mode=signup" className="px-6 py-4 border border-[rgb(var(--border-strong))] hover:border-[rgb(var(--border-strong))] text-[rgb(var(--text))] font-semibold rounded-xl text-sm transition text-center">Create Free Account</Link>
        </div>
        <div className="guide-content">
          <h2>HMRC invoice requirements</h2>
          <ul>
            <li>Unique invoice number</li>
            <li>Your name and address (or business name)</li>
            <li>Client name and address</li>
            <li>Date the invoice was issued</li>
            <li>Description of goods or services</li>
            <li>Amount charged (ex VAT)</li>
            <li>VAT amount and total (if VAT registered)</li>
            <li>Your VAT number (if VAT registered)</li>
          </ul>
          <h2>Related guides</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          {[
            ["How to Write an Invoice (UK)", "/guides/how-to-write-an-invoice-uk"],
            ["Quote Template UK", "/templates/quote-template-uk"],
            ["VAT Calculator", "/guides/vat-calculator-uk"],
            ["How to Get Paid Faster", "/guides/how-to-write-an-invoice-uk"],
          ].map(([l, h]) => (
            <Link key={h} href={h} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface)/0.5)] px-4 py-3 text-sm text-[rgb(var(--text))] hover:text-green-400 hover:border-green-600/30 transition">{l} →</Link>
          ))}
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
