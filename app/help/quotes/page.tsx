import type { Metadata } from "next";
import HelpLayout from "@/components/HelpLayout";

export const metadata: Metadata = {
  title: "Help: Quotes | GetJobQuotes",
  description: "How to use Quotes in GetJobQuotes. Step-by-step guide for UK tradespeople.",
};

export default function HelpQuotesPage() {
  return (
    <HelpLayout
      title="Quotes"
      description="Everything you need to know about Quotes in GetJobQuotes."
      breadcrumb="Quotes"
      related={[
        { label: "Getting Started", href: "/help/getting-started" },
        { label: "Back to Help Centre", href: "/help" },
      ]}
    >
      <p>This help article is coming soon. In the meantime, email us at <a href="mailto:hello@getjobquotes.uk">hello@getjobquotes.uk</a> and we will help you directly.</p>
      <p>Or <a href="/demo">try the demo</a> to see how it works.</p>
    </HelpLayout>
  );
}
