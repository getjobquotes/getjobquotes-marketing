import type { Metadata } from "next";
import Link from "next/link";
import GuideLayout from "@/components/GuideLayout";

export const metadata: Metadata = {
  title: "Free Invoice Template UK | For Sole Traders & Tradespeople | GetJobQuotes",
  description: "Free HMRC-compliant invoice template for UK sole traders and tradespeople. Use online or download as a PDF.",
};

export default function GuideInvoiceTemplate() {
  return (
    <GuideLayout title="Free Invoice Template UK" description="Free HMRC-compliant invoice template for UK sole traders." breadcrumb="Invoice Template UK">
      <h1>Free Invoice Template UK — HMRC Compliant (2024)</h1>
      <p className="lead">A free, professional invoice template for UK sole traders and tradespeople. Create an invoice online in minutes or download a PDF template.</p>

      <h2>HMRC Invoice Requirements</h2>
      <p>Your invoice must include:</p>
      <ul>
        <li>Unique invoice number</li>
        <li>Your name / business name and address</li>
        <li>Client name and address</li>
        <li>Date of issue</li>
        <li>Description of work done</li>
        <li>Amount (ex VAT if applicable)</li>
        <li>VAT amount and total (if VAT registered)</li>
      </ul>

      <h2>Create a Free Invoice Online</h2>
      <p>Use GetJobQuotes to create a professional invoice in minutes. If you already have a quote, convert it to an invoice in one click — no retyping needed.</p>
      <div className="not-prose flex flex-col sm:flex-row gap-3 my-6">
        <Link href="/auth?mode=signup" className="inline-block px-5 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-sm transition text-center">Create Free Invoice</Link>
        <Link href="/demo" className="inline-block px-5 py-3 border border-zinc-300 text-zinc-700 font-semibold rounded-xl text-sm transition text-center hover:border-zinc-400">Try Demo First</Link>
      </div>

      <h2>Tips for Getting Paid on Time</h2>
      <ul>
        <li>Send the invoice the same day the job is complete</li>
        <li>Include your bank account details (sort code and account number)</li>
        <li>Set clear payment terms — 14 or 30 days is standard</li>
        <li>Chase politely but promptly if payment is late</li>
        <li>Consider requiring a deposit upfront for larger jobs</li>
      </ul>

      <h2>Related Guides</h2>
      <ul>
        <li><Link href="/guides/how-to-write-an-invoice-uk">How to Write an Invoice (UK)</Link></li>
        <li><Link href="/guides/how-to-write-a-quote-uk">How to Write a Quote (UK)</Link></li>
        <li><Link href="/guides/vat-calculator-uk">VAT Calculator UK</Link></li>
      </ul>

      <h2>FAQs</h2>
      <h3>Is there a legal invoice format in the UK?</h3>
      <p>There is no prescribed format, but HMRC specifies what information must be included. As long as your invoice contains the required details, the format is up to you.</p>
      <h3>Do sole traders need to send invoices?</h3>
      <p>Yes. As a sole trader, you should send an invoice for every job. This creates a paper trail for your accounts and makes it easier to chase payments.</p>
    </GuideLayout>
  );
}
