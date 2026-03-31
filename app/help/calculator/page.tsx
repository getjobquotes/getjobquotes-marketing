import type { Metadata } from "next";
import HelpLayout from "@/components/HelpLayout";

export const metadata: Metadata = {
  title: "Help: Trade Calculator | GetJobQuotes",
  description: "How to use the built-in trade calculator in GetJobQuotes.",
};

export default function HelpCalculatorPage() {
  return (
    <HelpLayout
      title="Trade Calculator"
      description="How to use the built-in calculator for markup, VAT, day rates and materials."
      breadcrumb="Calculator"
      related={[
        { label: "VAT Calculator Guide", href: "/guides/vat-calculator-uk" },
        { label: "Labour Rate Calculator", href: "/guides/labour-rate-calculator-uk" },
        { label: "Back to Help Centre", href: "/help" },
      ]}
    >
      <h2>Opening the calculator</h2>
      <p>Click the <strong>🧮 Calculator</strong> button in the bottom-left corner of any page. It stays open as you work.</p>

      <h2>Standard calculator</h2>
      <p>The first tab (🔢) is a normal calculator. Use it for any quick maths. The result can be sent directly to the Markup or VAT tabs.</p>

      <h2>Markup calculator</h2>
      <p>Enter your cost and markup percentage. The calculator shows your sell price and profit. Quick presets: 10%, 20%, 30%, 50%.</p>

      <h2>VAT calculator</h2>
      <p>Switch between Add VAT (multiply by 1.20) and Remove VAT (divide by 1.20). Enter any amount to see the breakdown instantly.</p>

      <h2>Day rate calculator</h2>
      <p>Enter your day rate and number of days. The calculator shows the total including VAT, and your effective hourly rate.</p>

      <h2>Materials calculator</h2>
      <p>Enter material cost, your markup percentage and labour. The calculator shows the full job total ex-VAT and inc-VAT.</p>

      <h2>Saving calculations</h2>
      <p>Click <strong>Save to history</strong> on any tab to keep a record. View your last 20 calculations by clicking the 📋 button.</p>
    </HelpLayout>
  );
}
