import type { Metadata } from "next";
import HelpLayout from "@/components/HelpLayout";

export const metadata: Metadata = {
  title: "Getting Started | GetJobQuotes Help",
  description: "How to get started with GetJobQuotes. Step-by-step guide for UK tradespeople.",
};

export default function HelpGettingStartedPage() {
  return (
    <HelpLayout
      title="Getting Started"
      description="Everything you need to know to set up GetJobQuotes and create your first quote."
      breadcrumb="Getting Started"
      related={[
        { label: "How to create a quote", href: "/help/quotes" },
        { label: "How to add customers", href: "/help/customers" },
        { label: "Back to Help Centre", href: "/help" },
      ]}
    >
      <h2>1. Create your account</h2>
      <p>Sign up free at <a href="/auth?mode=signup">getjobquotes.uk/auth</a>. No credit card needed. Takes 30 seconds.</p>

      <h2>2. Set up your business profile</h2>
      <p>Go to <a href="/profile">Profile</a> and add your business name, logo, phone and email. This information appears on every quote and invoice you send.</p>

      <h2>3. Add your first customer</h2>
      <p>Go to <a href="/customers">Customers</a> and add a client. Once saved, you can fill their details into any new quote with one click.</p>

      <h2>4. Create your first quote</h2>
      <p>Click <strong>New Quote</strong> in the navigation. Add line items for labour and materials, toggle VAT if needed, then download the PDF or save it.</p>

      <h2>5. Send to your client</h2>
      <p>After saving a quote, share it via WhatsApp or email. Your client receives a link where they can view and accept the quote online.</p>

      <h2>Need more help?</h2>
      <p>Email us at <a href="mailto:hello@getjobquotes.uk">hello@getjobquotes.uk</a> and we will help you directly.</p>
    </HelpLayout>
  );
}
