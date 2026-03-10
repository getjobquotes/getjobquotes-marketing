import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for using GetJobQuotes — the quoting and invoicing tool for UK tradespeople.",
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "10 March 2026";
const CONTACT_EMAIL = "hello@getjobquotes.uk";
const APP_URL = "https://getjobquotes.uk";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white">

      {/* Nav */}
      <nav className="border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-base font-bold">
          <span className="text-green-400">Get</span>JobQuotes
        </Link>
        <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white transition">Dashboard →</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-14">

        {/* Header */}
        <div className="mb-12">
          <p className="text-green-400 text-xs font-semibold uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl font-bold mb-3">Terms & Conditions</h1>
          <p className="text-zinc-500 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-10 text-sm leading-relaxed text-zinc-300">

          {/* Intro */}
          <section>
            <p>
              These Terms and Conditions ("Terms") govern your use of GetJobQuotes ({APP_URL}), a quoting
              and invoicing service operated by GetJobQuotes ("we", "us", "our"). By creating an account
              or using the service, you agree to these Terms in full. If you do not agree, please do not
              use the service.
            </p>
            <p className="mt-3">
              These Terms are governed by the laws of England and Wales. Any disputes shall be subject to
              the exclusive jurisdiction of the courts of England and Wales.
            </p>
          </section>

          <Divider />

          {/* 1 */}
          <Section title="1. Who We Are">
            <p>
              GetJobQuotes is an online tool that allows self-employed tradespeople and small businesses
              based in the United Kingdom to create, send, and manage professional quotes and invoices.
              The service is provided as-is for business use.
            </p>
            <p className="mt-3">
              For any queries about these Terms, contact us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-green-400 hover:underline">{CONTACT_EMAIL}</a>.
            </p>
          </Section>

          <Divider />

          {/* 2 */}
          <Section title="2. Your Account">
            <ul className="list-disc pl-5 space-y-2">
              <li>You must be at least 18 years old and based in the United Kingdom to use GetJobQuotes.</li>
              <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
              <li>You must provide accurate, current and complete information when creating your account.</li>
              <li>You must notify us immediately at {CONTACT_EMAIL} if you suspect unauthorised access to your account.</li>
              <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
            </ul>
          </Section>

          <Divider />

          {/* 3 */}
          <Section title="3. Acceptable Use">
            <p>You may use GetJobQuotes only for lawful business purposes. You must not:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Use the service for any fraudulent, deceptive or illegal purpose, including creating fictitious quotes or invoices.</li>
              <li>Attempt to gain unauthorised access to any part of the service or another user's data.</li>
              <li>Upload any content that is unlawful, defamatory, or infringes third-party intellectual property rights.</li>
              <li>Use automated tools (bots, scrapers, crawlers) to access or extract data from the service.</li>
              <li>Reverse engineer, decompile or attempt to extract source code from the service.</li>
              <li>Resell, sublicense or commercially exploit the service without our written permission.</li>
              <li>Send unsolicited communications (spam) using any email or messaging feature within the service.</li>
            </ul>
            <p className="mt-3">
              We reserve the right to investigate and take appropriate action, including account termination
              and reporting to law enforcement, for any violations of the above.
            </p>
          </Section>

          <Divider />

          {/* 4 */}
          <Section title="4. Your Content">
            <p>
              You retain full ownership of all quotes, invoices, business details, logos and other content
              you create or upload ("Your Content"). By using GetJobQuotes, you grant us a limited, non-exclusive,
              royalty-free licence to store, process and display Your Content solely to provide the service to you.
            </p>
            <p className="mt-3">
              We do not sell, share or use Your Content for any purpose other than operating and improving the service.
              You are solely responsible for the accuracy and legality of all quotes and invoices you create.
            </p>
            <p className="mt-3">
              <strong className="text-white">Important:</strong> GetJobQuotes is a tool that helps you create
              documents — we are not a party to any contract between you and your clients. We accept no
              responsibility for disputes arising from quotes or invoices you create using the service.
            </p>
          </Section>

          <Divider />

          {/* 5 */}
          <Section title="5. Public Quote Links">
            <p>
              When you share a quote using a public link (/q/[token]), that link is accessible to anyone
              who has it. You are responsible for deciding who you share links with. We recommend:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Setting an expiry date on all shared quotes.</li>
              <li>Not including sensitive personal or financial information beyond what is necessary.</li>
            </ul>
            <p className="mt-3">
              Expired or deleted quotes will no longer be accessible via their public link.
            </p>
          </Section>

          <Divider />

          {/* 6 */}
          <Section title="6. Free Service & Availability">
            <p>
              GetJobQuotes is currently provided free of charge. We reserve the right to introduce paid
              features or subscription tiers in the future, with reasonable notice to existing users.
              Free features will not be removed without at least 30 days' notice.
            </p>
            <p className="mt-3">
              We aim to provide a reliable service but do not guarantee 100% uptime. The service is
              provided "as is" without warranty of any kind. We may temporarily suspend the service
              for maintenance, upgrades or circumstances beyond our control.
            </p>
          </Section>

          <Divider />

          {/* 7 */}
          <Section title="7. Intellectual Property">
            <p>
              The GetJobQuotes name, logo, design, software and all associated intellectual property are
              owned by us and protected by UK and international intellectual property law. Nothing in
              these Terms grants you any right to use our trademarks, branding or proprietary technology
              beyond what is necessary to use the service.
            </p>
          </Section>

          <Divider />

          {/* 8 */}
          <Section title="8. Limitation of Liability">
            <p>
              To the maximum extent permitted by applicable law:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>We shall not be liable for any indirect, incidental, special, consequential or punitive damages arising from your use of the service.</li>
              <li>We shall not be liable for any loss of business, revenue, profit, data or goodwill.</li>
              <li>We are not responsible for errors in quotes or invoices you create, or for any contractual disputes between you and your clients.</li>
              <li>Our total aggregate liability to you shall not exceed £100 or the total amount you have paid us in the 12 months prior to the claim, whichever is greater.</li>
            </ul>
            <p className="mt-3">
              Nothing in these Terms limits our liability for death or personal injury caused by our
              negligence, fraud or fraudulent misrepresentation, or any other liability that cannot be
              excluded under English law.
            </p>
          </Section>

          <Divider />

          {/* 9 */}
          <Section title="9. Termination">
            <p>
              You may delete your account at any time by contacting us at {CONTACT_EMAIL}. Upon deletion,
              your data will be permanently removed within 30 days, except where we are required to retain
              it by law.
            </p>
            <p className="mt-3">
              We may terminate or suspend your account immediately, without notice, if you breach these
              Terms, engage in fraudulent activity, or if required to do so by law.
            </p>
          </Section>

          <Divider />

          {/* 10 */}
          <Section title="10. Changes to These Terms">
            <p>
              We may update these Terms from time to time. When we make material changes, we will notify
              you by email and update the "Last updated" date at the top of this page. Continued use of
              the service after changes take effect constitutes acceptance of the updated Terms.
            </p>
          </Section>

          <Divider />

          {/* Contact */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3">Contact</h2>
            <p>
              Questions about these Terms? Email us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-green-400 hover:underline">{CONTACT_EMAIL}</a>.
              We aim to respond within 2 business days.
            </p>
          </section>

        </div>
      </div>

      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-white mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Divider() {
  return <hr className="border-zinc-800" />;
}

function Footer() {
  return (
    <footer className="border-t border-zinc-900 px-6 py-6 flex flex-wrap gap-4 text-xs text-zinc-700 justify-center">
      <Link href="/" className="hover:text-zinc-400 transition">Home</Link>
      <Link href="/privacy" className="hover:text-zinc-400 transition">Privacy Policy</Link>
      <Link href="/status" className="hover:text-zinc-400 transition">Status</Link>
      <a href="mailto:hello@getjobquotes.uk" className="hover:text-zinc-400 transition">Contact</a>
    </footer>
  );
}
