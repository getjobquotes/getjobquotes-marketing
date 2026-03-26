import type { Metadata } from "next";
import Link from "next/link";
import GuideLayout from "@/components/GuideLayout";

export const metadata: Metadata = {
  title: "Free Quote Template UK | Download for Tradespeople | GetJobQuotes",
  description: "Free professional quote template for UK tradespeople. Download a Word or PDF template or use our free online quote builder.",
};

export default function GuideQuoteTemplate() {
  return (
    <GuideLayout title="Free Quote Template UK" description="Download a free professional quote template for UK tradespeople." breadcrumb="Quote Template UK">
      <h1>Free Quote Template UK — For Tradespeople (2024)</h1>
      <p className="lead">Looking for a free quote template? We have created a professional quote template for UK tradespeople that you can use online or download as a PDF. No sign-up required for the demo.</p>

      <h2>What Makes a Good Quote Template?</h2>
      <p>A good quote template for UK tradespeople should:</p>
      <ul>
        <li>Look professional with your business name and logo</li>
        <li>Include all legally required information</li>
        <li>Have a clear breakdown of labour and materials</li>
        <li>Show VAT clearly (if applicable)</li>
        <li>Include payment terms</li>
        <li>Be easy to fill in quickly on site or in the van</li>
      </ul>

      <h2>Use Our Free Online Quote Builder</h2>
      <p>Instead of a static Word document, GetJobQuotes lets you create a fully branded quote PDF in under 2 minutes. Add your logo, line items, VAT and notes — then download or share it directly with your client.</p>
      <div className="not-prose flex flex-col sm:flex-row gap-3 my-6">
        <Link href="/demo" className="inline-block px-5 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-sm transition text-center">Try Free Quote Builder</Link>
        <Link href="/auth?mode=signup" className="inline-block px-5 py-3 border border-zinc-300 text-zinc-700 font-semibold rounded-xl text-sm transition text-center hover:border-zinc-400">Create Free Account</Link>
      </div>

      <h2>What to Include in Your Quote</h2>
      <p>See our full guide: <Link href="/guides/how-to-write-a-quote-uk">How to Write a Quote (UK)</Link>.</p>
      <p>Key sections your quote template must have:</p>
      <ul>
        <li><strong>Header</strong> — your business name, logo, contact details</li>
        <li><strong>Client details</strong> — name, address, contact</li>
        <li><strong>Quote reference + date + expiry</strong></li>
        <li><strong>Job description</strong> — what the work involves</li>
        <li><strong>Line items</strong> — labour, materials, other costs</li>
        <li><strong>Subtotal, VAT, total</strong></li>
        <li><strong>Terms</strong> — payment due date, accepted payment methods</li>
        <li><strong>Signature</strong> — optional but professional</li>
      </ul>

      <h2>Frequently Asked Questions</h2>
      <h3>Can I use a Word document as a quote template?</h3>
      <p>Yes, but it is slow and looks less professional. A dedicated tool like GetJobQuotes creates a better-looking quote faster and lets you share it instantly via WhatsApp or email.</p>
      <h3>Does my quote template need to be on headed paper?</h3>
      <p>No legal requirement exists for headed paper. However, including your logo and business details makes your quotes look more professional and trustworthy.</p>
      <h3>Can I customise the template?</h3>
      <p>With GetJobQuotes, you can add your logo, business details and signature. Your quotes will always look consistent and professional.</p>
    </GuideLayout>
  );
}
