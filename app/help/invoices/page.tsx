import type { Metadata } from "next";
import HelpLayout from "@/components/HelpLayout";

export const metadata: Metadata = {
  title: "Help: Invoices | GetJobQuotes",
  description: "How to create and send invoices using GetJobQuotes.",
};

export default function HelpInvoicesPage() {
  return (
    <HelpLayout
      title="Invoices"
      description="How to create invoices, convert from quotes and mark as paid."
      breadcrumb="Invoices"
      related={[
        { label: "Quotes", href: "/help/quotes" },
        { label: "How to Write an Invoice (Guide)", href: "/guides/how-to-write-an-invoice-uk" },
        { label: "Back to Help Centre", href: "/help" },
      ]}
    >
      <h2>Creating an invoice</h2>
      <p>You can create an invoice directly from <strong>New Quote</strong> — just switch the toggle from Quote to Invoice at the top.</p>

      <h2>Converting a quote to invoice</h2>
      <p>The easiest way. From your Dashboard, find any quote and click <strong>→ Invoice</strong>. The invoice is created with all the same client details and line items.</p>

      <h2>Marking as paid</h2>
      <p>From the Dashboard, click <strong>Mark Paid</strong> on any invoice. The status updates to Paid and the date is recorded.</p>

      <h2>Overdue invoices</h2>
      <p>Invoices that are more than 30 days old and unpaid are highlighted in red on your dashboard so you can chase them easily.</p>
    </HelpLayout>
  );
}
