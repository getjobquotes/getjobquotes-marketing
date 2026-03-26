import type { Metadata } from "next";
import Link from "next/link";
import { PublicFooter } from "@/components/GuideLayout";

export const metadata: Metadata = {
  title: "Contact GetJobQuotes | Support for UK Tradespeople",
  description: "Get in touch with the GetJobQuotes team. Support for quoting and invoicing software for UK tradespeople.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <nav className="border-b border-zinc-200 px-5 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-base font-bold">
            <span className="text-green-600">Get</span>JobQuotes
          </Link>
          <Link href="/auth?mode=signup"
            className="px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-500 text-white rounded-lg transition">
            Try Free
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-5 py-14">
        <h1 className="text-3xl font-bold mb-3">Contact Us</h1>
        <p className="text-zinc-500 mb-10">Got a question or need help? We would love to hear from you.</p>

        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <div className="rounded-2xl border border-zinc-200 p-6">
            <div className="text-2xl mb-3">📧</div>
            <h2 className="text-sm font-bold mb-1">General Enquiries</h2>
            <a href="mailto:hello@getjobquotes.uk" className="text-sm text-green-600 hover:underline">
              hello@getjobquotes.uk
            </a>
          </div>
          <div className="rounded-2xl border border-zinc-200 p-6">
            <div className="text-2xl mb-3">🛠️</div>
            <h2 className="text-sm font-bold mb-1">Technical Support</h2>
            <a href="mailto:support@getjobquotes.uk" className="text-sm text-green-600 hover:underline">
              support@getjobquotes.uk
            </a>
          </div>
        </div>

        <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-6 mb-8">
          <h2 className="text-base font-bold mb-3">Frequently Asked Questions</h2>
          <div className="space-y-4 text-sm">
            {[
              ["Is GetJobQuotes free?", "Yes. The free plan lets you create up to 5 quotes per month. Pro is £5.99/month for unlimited quotes."],
              ["Do I need a credit card to sign up?", "No. You can start for free with no payment details required."],
              ["Can I use GetJobQuotes on my phone?", "Yes. GetJobQuotes is mobile-first and works on any phone or tablet."],
              ["How do I cancel my Pro subscription?", "You can cancel anytime from your Settings page. No questions asked."],
            ].map(([q,a]) => (
              <div key={q}>
                <p className="font-semibold text-zinc-800">{q}</p>
                <p className="text-zinc-500 mt-0.5">{a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link href="/auth?mode=signup"
            className="inline-block px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-sm transition">
            Start Free — No Card Needed
          </Link>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
