import Link from "next/link";

const footerLinks = {
  product: [
    { label: "Features",   href: "/features" },
    { label: "Pricing",    href: "/pricing" },
    { label: "Demo",       href: "/demo" },
    { label: "Guides",     href: "/guides" },
    { label: "Help",       href: "/help" },
  ],
  forTrades: [
    { label: "Quote Template UK",     href: "/templates/quote-template-uk" },
    { label: "Invoice Template UK",   href: "/templates/invoice-template-uk" },
    { label: "VAT Calculator Guide",  href: "/guides/vat-calculator-uk" },
    { label: "Labour Rate Guide",     href: "/guides/labour-rate-calculator-uk" },
    { label: "How to Price a Job",    href: "/guides/how-to-price-a-job" },
  ],
  company: [
    { label: "About",    href: "/about" },
    { label: "Contact",  href: "/contact" },
    { label: "Status",   href: "/status" },
  ],
  legal: [
    { label: "Privacy Policy",    href: "/privacy" },
    { label: "Terms & Conditions",href: "/terms" },
    { label: "Cookie Policy",     href: "/cookies" },
  ],
};

interface PublicFooterProps {
  dark?: boolean; // true = black bg (for dark pages), false = white bg (light pages)
}

export default function PublicFooter({ dark = true }: PublicFooterProps) {
  const bg    = dark ? "border-zinc-900 bg-black"        : "border-zinc-200 bg-zinc-50";
  const title = dark ? "text-white"                       : "text-zinc-900";
  const head  = dark ? "text-zinc-500"                    : "text-zinc-500";
  const link  = dark ? "text-zinc-600 hover:text-zinc-400": "text-zinc-500 hover:text-zinc-900";
  const sub   = dark ? "border-zinc-900 text-zinc-700"    : "border-zinc-200 text-zinc-400";

  return (
    <footer className={`border-t ${bg} px-5 py-12 mt-8`}>
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-8 mb-10">

          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className={`text-sm font-bold block mb-3 ${title}`}>
              <span className="text-green-400">Get</span>JobQuotes
            </Link>
            <p className={`text-xs leading-relaxed ${head}`}>
              Professional quotes and invoices for UK tradespeople. Free to start.
            </p>
            <a href="mailto:hello@getjobquotes.uk"
              className="block text-xs text-green-400 hover:text-green-300 transition mt-3">
              hello@getjobquotes.uk
            </a>
          </div>

          {/* Product */}
          <div>
            <p className={`text-xs font-semibold uppercase tracking-widest mb-3 ${head}`}>Product</p>
            <div className="space-y-2">
              {footerLinks.product.map(l => (
                <Link key={l.href} href={l.href} className={`block text-xs transition ${link}`}>{l.label}</Link>
              ))}
            </div>
          </div>

          {/* For Trades */}
          <div>
            <p className={`text-xs font-semibold uppercase tracking-widest mb-3 ${head}`}>For Trades</p>
            <div className="space-y-2">
              {footerLinks.forTrades.map(l => (
                <Link key={l.href} href={l.href} className={`block text-xs transition ${link}`}>{l.label}</Link>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <p className={`text-xs font-semibold uppercase tracking-widest mb-3 ${head}`}>Company</p>
            <div className="space-y-2">
              {footerLinks.company.map(l => (
                <Link key={l.href} href={l.href} className={`block text-xs transition ${link}`}>{l.label}</Link>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <p className={`text-xs font-semibold uppercase tracking-widest mb-3 ${head}`}>Legal</p>
            <div className="space-y-2">
              {footerLinks.legal.map(l => (
                <Link key={l.href} href={l.href} className={`block text-xs transition ${link}`}>{l.label}</Link>
              ))}
            </div>
          </div>
        </div>

        <div className={`border-t ${sub} pt-6 flex flex-col sm:flex-row items-center justify-between gap-2`}>
          <p className="text-xs">© {new Date().getFullYear()} GetJobQuotes. Built for UK tradespeople.</p>
          <p className="text-xs">Free quoting and invoicing for UK trades</p>
        </div>
      </div>
    </footer>
  );
}
