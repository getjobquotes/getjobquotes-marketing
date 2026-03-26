import type { Metadata } from "next";
import Link from "next/link";
import GuideLayout from "@/components/GuideLayout";

export const metadata: Metadata = {
  title: "How to Price a Job as a UK Tradesperson | GetJobQuotes",
  description: "How to calculate your day rate, price materials, add markup and quote profitably. Free guide for UK plumbers, electricians and builders.",
};

export default function GuideHowToPriceAJob() {
  return (
    <GuideLayout title="How to Price a Job" description="Calculate your rates, price materials and quote profitably." breadcrumb="How to Price a Job">
      <h1>How to Price a Job as a UK Tradesperson (2024)</h1>
      <p className="lead">Pricing jobs correctly is critical for any tradesperson. Charge too little and you lose money. Charge too much and you lose clients. This guide shows you exactly how to price a job profitably.</p>

      <div className="not-prose bg-zinc-50 border border-zinc-200 rounded-xl p-5 my-6">
        <p className="text-sm font-semibold mb-3">📋 Contents</p>
        <ol className="space-y-1.5 text-sm text-zinc-600">
          {[["Calculate your minimum day rate","#dayrate"],["Price materials and add markup","#materials"],["Account for overheads","#overheads"],["Add profit margin","#profit"],["VAT","#vat"],["Use a calculator","#calculator"],["FAQs","#faqs"]].map(([l,h])=>(
            <li key={h}><a href={h} className="hover:text-green-600">{l}</a></li>
          ))}
        </ol>
      </div>

      <h2 id="dayrate">Step 1 — Calculate Your Minimum Day Rate</h2>
      <p>Start by working out how much you need to earn to cover your costs and pay yourself a fair wage. See our <Link href="/guides/labour-rate-calculator-uk">Labour Rate Calculator</Link> for a full breakdown.</p>
      <p>A simple formula:</p>
      <ul>
        <li>Annual salary you want (e.g. £40,000)</li>
        <li>Plus annual business costs (e.g. £8,000)</li>
        <li>Equals total you need to earn (£48,000)</li>
        <li>Divide by working days per year (e.g. 220)</li>
        <li>Minimum day rate = £218/day</li>
      </ul>
      <p>This is your floor — do not price below this.</p>

      <h2 id="materials">Step 2 — Price Materials and Add Markup</h2>
      <p>Never charge materials at cost price. You spend time sourcing them, collecting them, returning unused items and dealing with any quality issues. A materials markup of 15–30% is standard in the UK trades industry.</p>
      <ul>
        <li>List all materials needed with quantities</li>
        <li>Get accurate prices (not estimates)</li>
        <li>Add 15–30% markup</li>
        <li>Add delivery costs if applicable</li>
      </ul>

      <h2 id="overheads">Step 3 — Account for Overheads</h2>
      <p>Every job has hidden costs that many tradespeople forget to price in:</p>
      <ul>
        <li>Travel time and fuel</li>
        <li>Tools and equipment</li>
        <li>Insurance (public liability, van, tools)</li>
        <li>Phone and software costs</li>
        <li>Time spent quoting and admin</li>
      </ul>

      <h2 id="profit">Step 4 — Add Your Profit Margin</h2>
      <p>After covering all costs, you should aim for a profit margin. Most successful tradespeople target 15–25% net profit. This is what builds your business and provides a buffer for quiet periods.</p>

      <h2 id="vat">Step 5 — Add VAT (if applicable)</h2>
      <p>If you are VAT registered, add 20% to the total. Use our <Link href="/guides/vat-calculator-uk">free VAT calculator</Link> to check your figures. If you are not VAT registered, do not add VAT.</p>

      <h2 id="calculator">Use the Built-in Calculator</h2>
      <p>GetJobQuotes has a built-in trade calculator with markup, VAT, day rate and materials tabs — available on every page of the app. Use it to check your figures before sending a quote.</p>
      <div className="not-prose flex gap-3 my-4">
        <Link href="/auth?mode=signup" className="inline-block px-5 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-sm transition">Try Free Quote Tool</Link>
      </div>

      <h2 id="faqs">FAQs</h2>
      <h3>How much should a plumber charge per day in the UK?</h3>
      <p>Day rates for plumbers in the UK typically range from £150 to £350 per day depending on location, experience and type of work. London rates are generally higher.</p>
      <h3>How much should an electrician charge per hour in the UK?</h3>
      <p>Electricians typically charge £40 to £80 per hour in the UK. Specialist work such as EV charger installation or rewiring tends to attract higher rates.</p>
      <h3>Should I charge for call-outs?</h3>
      <p>Yes. A call-out charge (typically £50–£100) covers your time and travel to assess the job. This is standard practice and clients generally expect it.</p>
    </GuideLayout>
  );
}
