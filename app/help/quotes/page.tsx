import type { Metadata } from "next";
import HelpLayout from "@/components/HelpLayout";

export const metadata: Metadata = {
  title: "Help: Quotes | GetJobQuotes",
  description: "How to create, edit and send quotes using GetJobQuotes.",
};

export default function HelpQuotesPage() {
  return (
    <HelpLayout
      title="Quotes"
      description="How to create, edit, download and send professional quotes."
      breadcrumb="Quotes"
      related={[
        { label: "How to Write a Quote (Guide)", href: "/guides/how-to-write-a-quote-uk" },
        { label: "Invoices", href: "/help/invoices" },
        { label: "Back to Help Centre", href: "/help" },
      ]}
    >
      <h2>Creating a quote</h2>
      <p>Click <strong>New Quote</strong> in the navigation. Fill in the client details, add line items for labour and materials, then save or download.</p>

      <h2>Adding line items</h2>
      <p>Each line item has a description, quantity and unit price. The total is calculated automatically. Add as many items as needed.</p>

      <h2>VAT</h2>
      <p>Toggle the VAT switch to add 20% UK VAT. The subtotal, VAT amount and total are shown separately on the PDF.</p>

      <h2>Downloading the PDF</h2>
      <p>Click <strong>Download PDF</strong> to save the quote as a PDF file you can send by email or print.</p>

      <h2>Sending to a client</h2>
      <p>Save the quote first, then share the link via WhatsApp or email. Your client can view and accept the quote online without needing an account.</p>

      <h2>Converting to invoice</h2>
      <p>From the Dashboard, find the quote and click <strong>→ Invoice</strong>. A new invoice is created instantly with the same details.</p>
    </HelpLayout>
  );
}
