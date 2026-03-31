import type { Metadata } from "next";
import HelpLayout from "@/components/HelpLayout";

export const metadata: Metadata = {
  title: "Help: Getting Started | GetJobQuotes",
  description: "How to use Getting Started in GetJobQuotes. Step-by-step guide for UK tradespeople.",
};

export default function HelpGetting-startedPage() {
  return (
    <HelpLayout
      title="Getting Started"
      description="Everything you need to know about Getting Started in GetJobQuotes."
      breadcrumb="Getting Started"
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
