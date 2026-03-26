import type { Metadata } from "next";
import Link from "next/link";
import GuideLayout from "@/components/GuideLayout";

export const metadata: Metadata = {
  title: "Labour Rate Calculator UK | Day Rate for Tradespeople | GetJobQuotes",
  description: "Calculate your hourly and day rate as a UK tradesperson. Free labour rate calculator for plumbers, electricians, builders and more.",
};

export default function GuideLabourRateCalculator() {
  return (
    <GuideLayout title="Labour Rate Calculator UK" description="Calculate the right hourly and day rate for your trade." breadcrumb="Labour Rate Calculator">
      <h1>Labour Rate Calculator UK — What to Charge as a Tradesperson</h1>
      <p className="lead">Not sure what to charge? This guide walks you through calculating your minimum day rate and hourly rate as a UK tradesperson — so you never undercharge again.</p>

      <h2>Why Getting Your Rate Right Matters</h2>
      <p>Most tradespeople who struggle financially are undercharging — not overcharging. Setting your rate too low means you work hard but cannot grow your business, save for quiet periods or invest in better tools and training.</p>

      <h2>How to Calculate Your Day Rate</h2>
      <p>Use this simple formula:</p>
      <ol>
        <li><strong>Decide on your target annual take-home pay</strong> (e.g. £40,000)</li>
        <li><strong>Add your annual business costs</strong> — insurance, tools, van, phone, software (e.g. £10,000)</li>
        <li><strong>Add National Insurance and tax</strong> (approximately 25–30% of profits for a sole trader)</li>
        <li><strong>Work out how many billable days you will work</strong> — allow for holidays, sick days and unpaid admin (typically 180–220 days)</li>
        <li><strong>Divide your total required income by billable days</strong></li>
      </ol>

      <div className="not-prose bg-green-50 border border-green-200 rounded-xl p-5 my-6">
        <p className="text-sm font-semibold text-green-800 mb-2">Example Calculation</p>
        <ul className="text-sm text-zinc-700 space-y-1">
          <li>Target take-home: £40,000</li>
          <li>Business costs: £8,000</li>
          <li>Tax and NI (approx 28%): £13,440</li>
          <li>Total required revenue: £61,440</li>
          <li>Billable days: 200</li>
          <li><strong>Minimum day rate: £307/day</strong></li>
          <li><strong>Minimum hourly rate (8hr day): £38.40/hr</strong></li>
        </ul>
      </div>

      <h2>Average UK Trade Day Rates (2024)</h2>
      <ul>
        <li><strong>Plumber</strong> — £180–£350/day</li>
        <li><strong>Electrician</strong> — £180–£350/day</li>
        <li><strong>Builder / Bricklayer</strong> — £150–£300/day</li>
        <li><strong>Carpenter / Joiner</strong> — £150–£280/day</li>
        <li><strong>Plasterer</strong> — £140–£260/day</li>
        <li><strong>Painter and Decorator</strong> — £130–£250/day</li>
        <li><strong>Gas Engineer</strong> — £200–£400/day</li>
        <li><strong>Tiler</strong> — £130–£250/day</li>
      </ul>
      <p className="text-sm text-zinc-500">Note: London and South East rates are typically 20–40% higher than the national average.</p>

      <h2>Use the Built-in Calculator</h2>
      <p>GetJobQuotes has a built-in Day Rate calculator. Enter your day rate and number of days to get the total including VAT — available on every page of the app.</p>
      <div className="not-prose flex gap-3 my-4">
        <Link href="/auth?mode=signup" className="inline-block px-5 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-sm transition">Open Free Quote Tool</Link>
        <Link href="/demo" className="inline-block px-5 py-3 border border-zinc-300 text-zinc-700 font-semibold rounded-xl text-sm transition text-center hover:border-zinc-400">Try Demo</Link>
      </div>

      <h2>FAQs</h2>
      <h3>Should I charge VAT on top of my day rate?</h3>
      <p>Only if you are VAT registered. If your turnover exceeds £90,000 (2024/25 threshold), you must register for VAT. See our <Link href="/guides/vat-calculator-uk">VAT calculator guide</Link>.</p>
      <h3>How do I increase my rates without losing clients?</h3>
      <p>Increase rates gradually (5–10% per year), give existing clients notice, and focus on the value you provide. Clients who only care about the lowest price are rarely the best clients to keep.</p>
      <h3>Should I charge the same rate for all jobs?</h3>
      <p>Not necessarily. Emergency call-outs, specialist work and difficult access jobs typically justify higher rates. You can charge a premium for weekend or evening work.</p>
    </GuideLayout>
  );
}
