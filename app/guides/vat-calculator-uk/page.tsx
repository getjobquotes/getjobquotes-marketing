import type { Metadata } from "next";
import Link from "next/link";
import GuideLayout from "@/components/GuideLayout";

export const metadata: Metadata = {
  title: "VAT Calculator UK | Free Tool for Tradespeople | GetJobQuotes",
  description: "Free UK VAT calculator. Add or remove 20% VAT from any price instantly. Guide to VAT for UK sole traders and tradespeople.",
};

export default function GuideVatCalculator() {
  return (
    <GuideLayout title="VAT Calculator UK" description="Add or remove 20% UK VAT from any price instantly." breadcrumb="VAT Calculator UK">
      <h1>Free VAT Calculator UK — Add or Remove 20% VAT</h1>
      <p className="lead">A free VAT calculator for UK tradespeople. Add or remove 20% VAT from any amount — plus a complete guide to VAT for sole traders and tradespeople.</p>

      <div className="not-prose bg-zinc-50 border border-zinc-200 rounded-xl p-6 my-6">
        <p className="text-sm font-semibold text-zinc-700 mb-4">🧮 Quick VAT Formulas</p>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <span className="font-mono bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">Add VAT</span>
            <span className="text-zinc-600">Price × 1.20 = Price including VAT</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">Remove VAT</span>
            <span className="text-zinc-600">Price ÷ 1.20 = Price excluding VAT</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-mono bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded text-xs">VAT amount</span>
            <span className="text-zinc-600">Price × 0.20 = VAT amount (from ex-VAT price)</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-zinc-200">
          <Link href="/auth?mode=signup" className="text-sm text-green-600 font-medium hover:text-green-700">
            Use the built-in VAT calculator in GetJobQuotes →
          </Link>
        </div>
      </div>

      <h2>VAT Rate Examples</h2>
      <div className="not-prose overflow-x-auto my-4">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-zinc-100">
              <th className="text-left p-3 border border-zinc-200 font-semibold">Ex-VAT Price</th>
              <th className="text-left p-3 border border-zinc-200 font-semibold">VAT (20%)</th>
              <th className="text-left p-3 border border-zinc-200 font-semibold">Inc-VAT Total</th>
            </tr>
          </thead>
          <tbody>
            {[[100,20,120],[250,50,300],[500,100,600],[1000,200,1200],[2500,500,3000],[5000,1000,6000]].map(([ex,vat,inc])=>(
              <tr key={ex} className="border-b border-zinc-100">
                <td className="p-3 border border-zinc-200">£{ex.toLocaleString()}</td>
                <td className="p-3 border border-zinc-200 text-yellow-600">£{vat.toLocaleString()}</td>
                <td className="p-3 border border-zinc-200 font-semibold text-green-600">£{inc.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Do I Need to Register for VAT?</h2>
      <p>You must register for VAT if your taxable turnover exceeds <strong>£90,000</strong> in a rolling 12-month period (2024/25 threshold). You can also register voluntarily below this threshold.</p>

      <h2>VAT on Building and Construction Work</h2>
      <p>Most building and construction work is standard rated (20% VAT). However, some work is zero rated or reduced rated:</p>
      <ul>
        <li><strong>Zero rated (0%)</strong> — new residential buildings, certain conversions</li>
        <li><strong>Reduced rate (5%)</strong> — energy-saving materials, residential conversions, some renovation work</li>
        <li><strong>Standard rate (20%)</strong> — most repairs, maintenance and improvements</li>
      </ul>
      <p>If you are unsure which rate applies to your work, check with HMRC or an accountant.</p>

      <h2>Use the Free VAT Calculator in GetJobQuotes</h2>
      <p>GetJobQuotes has a built-in VAT calculator available on every page. Add or remove VAT from any amount instantly, and it automatically applies to your quotes and invoices.</p>
      <div className="not-prose flex flex-col sm:flex-row gap-3 my-4">
        <Link href="/auth?mode=signup" className="inline-block px-5 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-sm transition text-center">Try Free Quote Tool</Link>
        <Link href="/demo" className="inline-block px-5 py-3 border border-zinc-300 text-zinc-700 font-semibold rounded-xl text-sm transition text-center hover:border-zinc-400">Open Demo</Link>
      </div>

      <h2>FAQs</h2>
      <h3>What is the current UK VAT rate?</h3>
      <p>The standard UK VAT rate is 20%. There is also a reduced rate of 5% for certain goods and services, and a zero rate (0%) for others.</p>
      <h3>Do I charge VAT on labour?</h3>
      <p>If you are VAT registered, yes — VAT applies to both labour and materials unless the work is zero or reduced rated.</p>
      <h3>Can I reclaim VAT on materials?</h3>
      <p>Yes, if you are VAT registered. You can reclaim VAT on business purchases, including materials you buy for jobs.</p>
    </GuideLayout>
  );
}
