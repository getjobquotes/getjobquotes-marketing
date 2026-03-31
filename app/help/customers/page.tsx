import type { Metadata } from "next";
import HelpLayout from "@/components/HelpLayout";

export const metadata: Metadata = {
  title: "Help: Customers | GetJobQuotes",
  description: "How to add and manage customers in GetJobQuotes.",
};

export default function HelpCustomersPage() {
  return (
    <HelpLayout
      title="Customers"
      description="How to save clients and fill quotes instantly on repeat jobs."
      breadcrumb="Customers"
      related={[
        { label: "Quotes", href: "/help/quotes" },
        { label: "Back to Help Centre", href: "/help" },
      ]}
    >
      <h2>Adding a customer</h2>
      <p>Go to <a href="/customers">Customers</a> and click <strong>Add Customer</strong>. Enter their name, email, phone and address.</p>

      <h2>Using a saved customer in a quote</h2>
      <p>When creating a new quote, select the customer from the dropdown at the top of the form. Their details fill in automatically.</p>

      <h2>Editing a customer</h2>
      <p>Go to Customers, find the client and click <strong>Edit</strong>. Changes apply to new quotes — existing quotes are not affected.</p>

      <h2>Quick quote from customer list</h2>
      <p>Click the <strong>+ Quote</strong> button next to any customer to go straight to the quote form with their details pre-filled.</p>
    </HelpLayout>
  );
}
