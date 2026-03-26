import type { Metadata } from "next";
import Link from "next/link";
import GuideLayout from "@/components/GuideLayout";

export const metadata: Metadata = {
  title: "How to Write a Quote UK | Free Guide for Tradespeople | GetJobQuotes",
  description: "Step-by-step guide on how to write a professional quote as a UK tradesperson. What to include, how to price and how to send quotes to clients.",
  openGraph: {
    title: "How to Write a Quote UK — Free Guide for Tradespeople",
    description: "Step-by-step guide on writing professional quotes as a UK tradesperson.",
    url: "https://getjobquotes.uk/guides/how-to-write-a-quote-uk",
  },
};

export default function GuideHowToWriteAQuote() {
  return (
    <GuideLayout
      title="How to Write a Quote (UK)"
      description="Step-by-step guide to writing professional quotes that win jobs."
      breadcrumb="How to Write a Quote"
    >
      <h1>How to Write a Quote as a UK Tradesperson (2024 Guide)</h1>

      <p className="lead">
        Writing a professional quote is one of the most important skills for any UK tradesperson.
        A clear, detailed quote builds trust, protects you legally, and helps you win more jobs.
        This guide covers everything you need to know — from what to include to how to send it.
      </p>

      <div className="not-prose bg-zinc-50 border border-zinc-200 rounded-xl p-5 my-6">
        <p className="text-sm font-semibold text-zinc-700 mb-3">📋 Table of Contents</p>
        <ol className="space-y-1.5 text-sm text-zinc-600">
          {[
            ["What is a quote?", "#what-is-a-quote"],
            ["What to include in a quote", "#what-to-include"],
            ["How to price a job", "#how-to-price"],
            ["Quote vs estimate — what's the difference?", "#quote-vs-estimate"],
            ["How to send a quote", "#how-to-send"],
            ["Common mistakes to avoid", "#common-mistakes"],
            ["Free quote template", "#free-template"],
            ["FAQs", "#faqs"],
          ].map(([label, href]) => (
            <li key={href}><a href={href} className="hover:text-green-600 transition">{label}</a></li>
          ))}
        </ol>
      </div>

      <h2 id="what-is-a-quote">What is a Quote?</h2>
      <p>
        A quote (also called a quotation) is a fixed-price offer to complete a specific job for a client.
        Unlike an estimate, a quote is legally binding once accepted — meaning you must complete the work
        for the price stated unless the client requests changes.
      </p>
      <p>
        For UK tradespeople — plumbers, electricians, builders, decorators and more — sending professional
        quotes is essential for winning jobs and protecting yourself if disputes arise.
      </p>

      <h2 id="what-to-include">What to Include in a Quote</h2>
      <p>A professional UK trade quote should include the following information:</p>

      <h3>1. Your Business Details</h3>
      <ul>
        <li>Business name and trading name</li>
        <li>Your name (if sole trader)</li>
        <li>Business address</li>
        <li>Phone number and email address</li>
        <li>Company registration number (if limited company)</li>
        <li>VAT number (if VAT registered)</li>
      </ul>

      <h3>2. Client Details</h3>
      <ul>
        <li>Client name or company name</li>
        <li>Client address</li>
        <li>Contact email and phone</li>
      </ul>

      <h3>3. Quote Reference Number</h3>
      <p>
        Always include a unique reference number (e.g. QUO-001). This makes it easy to track quotes
        and reference them in future communications.
      </p>

      <h3>4. Date and Expiry Date</h3>
      <p>
        Include the date the quote was issued and an expiry date (typically 30 days).
        This protects you from being held to old prices if material costs increase.
      </p>

      <h3>5. Detailed Breakdown of Work</h3>
      <p>Be specific. Break down each task, material or phase of the job:</p>
      <ul>
        <li>Labour costs (hours or day rate)</li>
        <li>Materials with quantities and unit prices</li>
        <li>Any subcontractor costs</li>
        <li>Call-out charges if applicable</li>
      </ul>

      <h3>6. VAT</h3>
      <p>
        If you are VAT registered, show the subtotal, VAT amount (20%) and the total including VAT separately.
        If you are not VAT registered, state this clearly.
      </p>

      <h3>7. Total Price</h3>
      <p>
        Show a clear, prominent total. Clients should not have to calculate the total themselves.
      </p>

      <h3>8. Terms and Conditions</h3>
      <p>Include brief payment terms:</p>
      <ul>
        <li>Payment due date (e.g. within 30 days of invoice)</li>
        <li>Accepted payment methods</li>
        <li>Deposit requirements (if any)</li>
        <li>What happens if the scope of work changes</li>
      </ul>

      <h2 id="how-to-price">How to Price a Job</h2>
      <p>Pricing is the hardest part for most tradespeople. Here is a simple framework:</p>

      <h3>Step 1 — Calculate Your Labour Cost</h3>
      <p>
        Work out how many hours or days the job will take. Multiply by your day rate or hourly rate.
        If you are unsure what to charge, see our{" "}
        <Link href="/guides/labour-rate-calculator-uk">Labour Rate Calculator guide</Link>.
      </p>

      <h3>Step 2 — Add Materials</h3>
      <p>
        List all materials needed with quantities. Add a markup (typically 15–30%) to cover your time
        sourcing materials, transport and warranty. See our{" "}
        <Link href="/guides/how-to-price-a-job">full guide on pricing a job</Link>.
      </p>

      <h3>Step 3 — Add VAT (if applicable)</h3>
      <p>
        If VAT registered, add 20% to your total. Use our free{" "}
        <Link href="/guides/vat-calculator-uk">VAT Calculator</Link> to check your figures.
      </p>

      <h3>Step 4 — Add a Contingency</h3>
      <p>
        Add 10–15% contingency for unexpected issues, especially on older properties or complex jobs.
        State this in your quote so clients understand.
      </p>

      <h2 id="quote-vs-estimate">Quote vs Estimate — What is the Difference?</h2>
      <p>This is one of the most common questions from tradespeople:</p>
      <ul>
        <li><strong>Quote</strong> — a fixed price that is legally binding once accepted. You must complete the job for this price.</li>
        <li><strong>Estimate</strong> — an approximate price that can change. Less legally binding but more flexible.</li>
      </ul>
      <p>
        Most clients prefer a quote as it gives them certainty. For complex jobs where the scope is unclear,
        an estimate may be more appropriate.
      </p>

      <h2 id="how-to-send">How to Send a Quote</h2>
      <p>There are several ways to send a quote to a client:</p>
      <ul>
        <li><strong>Email</strong> — attach a PDF or share a link. Professional and leaves a paper trail.</li>
        <li><strong>WhatsApp</strong> — increasingly popular with clients. Share a link they can view on their phone.</li>
        <li><strong>In person</strong> — print the quote or show it on your phone. Less common but works for some clients.</li>
        <li><strong>Post</strong> — for formal commercial work or large contracts.</li>
      </ul>
      <p>
        Using a tool like <Link href="/demo">GetJobQuotes</Link>, you can create a professional PDF quote
        and share it via WhatsApp or email in under 2 minutes — directly from your phone.
      </p>

      <h2 id="common-mistakes">Common Mistakes to Avoid</h2>
      <ul>
        <li><strong>Being too vague</strong> — vague quotes lead to disputes. Always be specific about what is and is not included.</li>
        <li><strong>No expiry date</strong> — material prices change. Always include an expiry date.</li>
        <li><strong>No terms and conditions</strong> — protect yourself with clear payment terms.</li>
        <li><strong>Verbal quotes only</strong> — always follow up with a written quote, even if you discussed the price on site.</li>
        <li><strong>Underpricing</strong> — many tradespeople undercharge, especially when starting out. Know your worth.</li>
      </ul>

      <h2 id="free-template">Free Quote Template</h2>
      <p>
        Instead of creating a quote from scratch, use our free online quote tool. It generates a
        professional branded PDF with your logo, signature and all required information — in under 2 minutes.
      </p>
      <div className="not-prose flex flex-col sm:flex-row gap-3 my-4">
        <Link href="/auth?mode=signup"
          className="inline-block px-5 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-sm transition text-center">
          Create Free Quote Now
        </Link>
        <Link href="/demo"
          className="inline-block px-5 py-3 border border-zinc-300 hover:border-zinc-400 text-zinc-700 font-semibold rounded-xl text-sm transition text-center">
          Try the Demo First
        </Link>
      </div>
      <p>Also see our <Link href="/guides/quote-template-uk">free quote template download</Link>.</p>

      <h2 id="faqs">Frequently Asked Questions</h2>

      <h3>Does a quote have to be in writing?</h3>
      <p>
        There is no legal requirement for a quote to be in writing, but written quotes are strongly recommended.
        A written quote protects both you and the client if a dispute arises.
      </p>

      <h3>Can I charge more than my quote?</h3>
      <p>
        Generally, no. A quote is a fixed price. However, if the client requests additional work or
        if unforeseen issues arise (e.g. hidden damage), you should issue a variation order and get
        written agreement before proceeding with extra charges.
      </p>

      <h3>How long should a quote be valid for?</h3>
      <p>
        Most tradespeople set quotes to expire after 30 days. This protects you from material price increases.
        For larger projects, 14 days may be more appropriate.
      </p>

      <h3>Do I need to be VAT registered to send quotes?</h3>
      <p>
        No. You can send quotes whether or not you are VAT registered. If you are not VAT registered,
        simply state that VAT is not applicable.
      </p>

      <h3>What software do tradespeople use to write quotes?</h3>
      <p>
        Many tradespeople use <Link href="/">GetJobQuotes</Link> — a free tool built specifically for
        UK trades. Others use Word documents, Excel or general invoicing software. A dedicated quoting
        tool like GetJobQuotes saves time and looks more professional.
      </p>
    </GuideLayout>
  );
}
