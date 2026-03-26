import type { Metadata } from "next";
import Link from "next/link";
import GuideLayout from "@/components/GuideLayout";

export const metadata: Metadata = {
  title: "How to Write an Invoice UK | Guide for Tradespeople | GetJobQuotes",
  description: "How to write a legal, professional invoice as a UK tradesperson or sole trader. What to include, HMRC rules and free invoice template.",
};

export default function GuideHowToWriteAnInvoice() {
  return (
    <GuideLayout title="How to Write an Invoice (UK)" description="Write legal, professional invoices as a UK tradesperson." breadcrumb="How to Write an Invoice">
      <h1>How to Write an Invoice as a UK Tradesperson (Complete Guide)</h1>
      <p className="lead">
        Every UK tradesperson needs to know how to write a proper invoice. This guide covers what
        HMRC requires, what to include, and how to get paid faster.
      </p>

      <div className="not-prose bg-zinc-50 border border-zinc-200 rounded-xl p-5 my-6">
        <p className="text-sm font-semibold text-zinc-700 mb-3">📋 Table of Contents</p>
        <ol className="space-y-1.5 text-sm text-zinc-600">
          {[["What is an invoice?","#what"],["What HMRC requires","#hmrc"],["Invoice vs quote","#vs"],["How to get paid faster","#faster"],["Free invoice template","#template"],["FAQs","#faqs"]].map(([l,h])=>(
            <li key={h}><a href={h} className="hover:text-green-600">{l}</a></li>
          ))}
        </ol>
      </div>

      <h2 id="what">What is an Invoice?</h2>
      <p>An invoice is a formal request for payment after completing work. Unlike a quote (which is issued before the job), an invoice is issued after the job is complete or at agreed milestones. It is a legal document and an important part of your financial records.</p>

      <h2 id="hmrc">What HMRC Requires on an Invoice</h2>
      <p>For most sole traders and small businesses, HMRC requires invoices to include:</p>
      <ul>
        <li>A unique invoice number</li>
        <li>Your name and address (or business name)</li>
        <li>The client's name and address</li>
        <li>The date the invoice was issued</li>
        <li>A description of the goods or services provided</li>
        <li>The amount charged (excluding VAT)</li>
        <li>VAT amount (if VAT registered)</li>
        <li>Total amount due</li>
      </ul>
      <p>If you are VAT registered, your invoice must also include your VAT registration number and show VAT separately.</p>

      <h2 id="vs">Invoice vs Quote — Key Differences</h2>
      <ul>
        <li><strong>Quote</strong> — issued before work starts. Sets the agreed price. See our <Link href="/guides/how-to-write-a-quote-uk">guide to writing a quote</Link>.</li>
        <li><strong>Invoice</strong> — issued after work is complete (or in stages). Requests payment.</li>
      </ul>
      <p>GetJobQuotes lets you convert a quote into an invoice in one click — no retyping required.</p>

      <h2 id="faster">How to Get Paid Faster</h2>
      <ul>
        <li><strong>Send invoices immediately</strong> — the sooner you send it, the sooner you get paid.</li>
        <li><strong>Include bank details</strong> — make it easy for clients to pay by bank transfer.</li>
        <li><strong>Set clear payment terms</strong> — state the due date clearly (e.g. "Payment due within 14 days").</li>
        <li><strong>Follow up</strong> — send a polite reminder if payment is late.</li>
        <li><strong>Accept card payments</strong> — consider using a payment link for faster payment.</li>
      </ul>

      <h2 id="template">Free Invoice Template</h2>
      <p>Use <Link href="/demo">GetJobQuotes</Link> to create a professional invoice instantly. Convert your quote to an invoice in one click, download the PDF and send it to your client by email or WhatsApp.</p>
      <div className="not-prose flex flex-col sm:flex-row gap-3 my-4">
        <Link href="/auth?mode=signup" className="inline-block px-5 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-sm transition text-center">Create Free Invoice</Link>
        <Link href="/guides/invoice-template-uk" className="inline-block px-5 py-3 border border-zinc-300 text-zinc-700 font-semibold rounded-xl text-sm transition text-center hover:border-zinc-400">Download Template</Link>
      </div>

      <h2 id="faqs">Frequently Asked Questions</h2>
      <h3>How long should I keep invoices?</h3>
      <p>HMRC requires you to keep business records for at least 5 years after the self-assessment deadline for the tax year they relate to. For VAT registered businesses, records must be kept for 6 years.</p>
      <h3>Can I send invoices by WhatsApp?</h3>
      <p>Yes. There is no legal requirement to send invoices by post or email. WhatsApp is increasingly common for tradespeople. Using GetJobQuotes, you can share an invoice link directly via WhatsApp.</p>
      <h3>What if a client does not pay?</h3>
      <p>Send a written reminder first. If payment is still not received, you can issue a formal letter before action and pursue the debt through the small claims court (up to £10,000 in England and Wales).</p>
    </GuideLayout>
  );
}
