import Link from "next/link";
import FeedbackButton from "./FeedbackButton";

export default function AppFooter() {
  return (
    <footer className="border-t border-zinc-900 px-4 sm:px-6 py-10 mt-8">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
          <div>
            <p className="text-sm font-bold mb-3">
              <span className="text-green-400">Get</span>JobQuotes
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Professional quotes and invoices for UK tradespeople. Free to start.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Guides</p>
            <div className="space-y-1.5">
              {[
                ["How to Write a Quote", "/guides/how-to-write-a-quote-uk"],
                ["How to Write an Invoice", "/guides/how-to-write-an-invoice-uk"],
                ["Quote Template UK", "/guides/quote-template-uk"],
                ["How to Price a Job", "/guides/how-to-price-a-job"],
                ["VAT Calculator", "/guides/vat-calculator-uk"],
                ["Labour Rate Calculator", "/guides/labour-rate-calculator-uk"],
              ].map(([label, href]) => (
                <Link key={href} href={href} className="block text-xs text-zinc-600 hover:text-zinc-400 transition">{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Product</p>
            <div className="space-y-1.5">
              {[
                ["Dashboard", "/dashboard"],
                ["New Quote", "/tool"],
                ["Customers", "/customers"],
                ["Profile", "/profile"],
                ["Pricing", "/pricing"],
                ["Demo", "/demo"],
              ].map(([label, href]) => (
                <Link key={href} href={href} className="block text-xs text-zinc-600 hover:text-zinc-400 transition">{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Company</p>
            <div className="space-y-1.5">
              {[
                ["Help", "/help"],
                ["Contact", "/contact"],
                ["Privacy Policy", "/privacy"],
                ["Terms & Conditions", "/terms"],
                ["Status", "/status"],
              ].map(([label, href]) => (
                <Link key={href} href={href} className="block text-xs text-zinc-600 hover:text-zinc-400 transition">{label}</Link>
              ))}
              <a href="mailto:hello@getjobquotes.uk" className="block text-xs text-zinc-600 hover:text-zinc-400 transition">
                hello@getjobquotes.uk
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-zinc-900 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-zinc-700">© {new Date().getFullYear()} GetJobQuotes. Built for UK tradespeople.</p>
          <div className="flex items-center gap-4">
            <p className="text-xs text-zinc-700">Free quoting and invoicing for UK trades</p>
            <FeedbackButton />
          </div>
        </div>
      </div>
    </footer>
  );
}
