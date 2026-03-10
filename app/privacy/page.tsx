import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How GetJobQuotes collects, uses and protects your personal data under UK GDPR.",
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "10 March 2026";
const CONTACT_EMAIL = "hello@getjobquotes.uk";

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-bold mb-3">Privacy Policy</h1>
          <p className="text-zinc-500 text-sm">Last updated: {LAST_UPDATED}</p>
          <div className="mt-6 rounded-xl border border-green-600/20 bg-green-600/5 px-5 py-4 text-sm text-zinc-300">
            <strong className="text-white">Short version:</strong> We collect only what we need to run
            the service. We don't sell your data. You can delete everything at any time.
          </div>
        </div>

        <div className="space-y-10 text-sm leading-relaxed text-zinc-300">

          {/* Intro */}
          <section>
            <p>
              GetJobQuotes ("we", "us", "our") is committed to protecting your personal data. This Privacy
              Policy explains how we collect, use, store and protect your information when you use
              GetJobQuotes (https://getjobquotes.uk).
            </p>
            <p className="mt-3">
              We act as the <strong className="text-white">data controller</strong> for your personal data.
              This policy complies with the UK General Data Protection Regulation (UK GDPR) and the
              Data Protection Act 2018.
            </p>
          </section>

          <Divider />

          {/* 1 */}
          <Section title="1. What Data We Collect">

            <SubSection title="Account data">
              <p>When you create an account:</p>
              <DataTable rows={[
                ["Email address", "Account creation and login", "Contractual necessity"],
                ["Name", "Personalisation (e.g. welcome email)", "Legitimate interest"],
                ["Profile picture", "Via Google OAuth only (if you sign in with Google)", "Consent"],
              ]} />
            </SubSection>

            <SubSection title="Business profile data">
              <p>Information you voluntarily add to your profile:</p>
              <DataTable rows={[
                ["Business name", "Appears on your quotes and invoices", "Contractual necessity"],
                ["Business address", "Appears on your quotes and invoices", "Contractual necessity"],
                ["Phone number", "Appears on your quotes and invoices", "Contractual necessity"],
                ["Business logo", "Stored in our file storage, appears on PDFs", "Contractual necessity"],
                ["Signature", "Optional, appears on your PDFs", "Consent"],
              ]} />
            </SubSection>

            <SubSection title="Quote and invoice data">
              <p>
                Documents you create — including client names, email addresses, line items, amounts and
                notes — are stored in our database and associated with your account. <strong className="text-white">
                Your clients' data is your responsibility</strong> under UK GDPR. By saving client data,
                you confirm you have a lawful basis to do so.
              </p>
            </SubSection>

            <SubSection title="Usage data">
              <p>We automatically collect:</p>
              <DataTable rows={[
                ["IP address", "Security, rate limiting and fraud prevention", "Legitimate interest"],
                ["Browser and device type", "Service compatibility and debugging", "Legitimate interest"],
                ["Pages visited, time on site", "Analytics via Google Analytics 4", "Consent (cookie banner)"],
                ["Error logs", "Debugging via Sentry", "Legitimate interest"],
              ]} />
            </SubSection>

          </Section>

          <Divider />

          {/* 2 */}
          <Section title="2. How We Use Your Data">
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white">Providing the service:</strong> Creating, storing and displaying your quotes and invoices.</li>
              <li><strong className="text-white">Sending emails:</strong> Welcome email on signup, transactional emails (quote links, invoice reminders) that you initiate.</li>
              <li><strong className="text-white">Account security:</strong> Authentication, detecting suspicious activity, rate limiting.</li>
              <li><strong className="text-white">Service improvements:</strong> Aggregated, anonymised analytics to understand how the product is used.</li>
              <li><strong className="text-white">Legal compliance:</strong> Retaining records where required by UK law.</li>
            </ul>
            <p className="mt-4">
              We will <strong className="text-white">never</strong> sell your data, share it with advertisers
              for targeting purposes, or use it for any purpose not listed above.
            </p>
          </Section>

          <Divider />

          {/* 3 */}
          <Section title="3. Cookies">
            <p>We use the following cookies:</p>
            <div className="mt-4 rounded-xl border border-zinc-800 overflow-hidden">
              {[
                { name: "Authentication cookies", purpose: "Keep you logged in. Set by Supabase.", type: "Essential", canOpt: false },
                { name: "gjq_cookie_consent", purpose: "Remembers your cookie preference.", type: "Essential", canOpt: false },
                { name: "Google Analytics (_ga, _gid)", purpose: "Anonymous usage analytics. Helps us improve the product.", type: "Analytics", canOpt: true },
                { name: "Google AdSense", purpose: "Displays relevant adverts to support the free service.", type: "Advertising", canOpt: true },
              ].map((c, i, arr) => (
                <div key={c.name} className={`px-5 py-4 ${i < arr.length - 1 ? "border-b border-zinc-800" : ""}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-white font-medium text-sm">{c.name}</p>
                      <p className="text-zinc-500 text-xs mt-1">{c.purpose}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.type === "Essential" ? "bg-green-500/10 text-green-400" : c.type === "Analytics" ? "bg-blue-500/10 text-blue-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                        {c.type}
                      </span>
                      <span className="text-xs text-zinc-600">{c.canOpt ? "Can opt out" : "Required"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4">
              You can manage your cookie preferences at any time using the cookie banner at the bottom
              of any page. Choosing "Essential Only" will disable analytics and advertising cookies.
            </p>
          </Section>

          <Divider />

          {/* 4 */}
          <Section title="4. Who We Share Data With">
            <p>We use a small number of trusted third-party services to operate GetJobQuotes:</p>
            <div className="mt-4 space-y-3">
              {[
                { name: "Supabase", role: "Database, file storage and authentication", location: "EU / USA", link: "https://supabase.com/privacy" },
                { name: "Vercel", role: "Hosting and serverless functions", location: "USA (with EU edge)", link: "https://vercel.com/legal/privacy-policy" },
                { name: "Resend", role: "Transactional email delivery", location: "USA", link: "https://resend.com/privacy" },
                { name: "Google Analytics", role: "Usage analytics (anonymised)", location: "USA", link: "https://policies.google.com/privacy" },
                { name: "Google AdSense", role: "Advertising (consent-gated)", location: "USA", link: "https://policies.google.com/privacy" },
                { name: "Sentry", role: "Error monitoring and debugging", location: "USA", link: "https://sentry.io/privacy/" },
              ].map((s) => (
                <div key={s.name} className="rounded-xl border border-zinc-800 px-4 py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-white text-sm font-medium">{s.name}</p>
                    <p className="text-zinc-500 text-xs">{s.role} · {s.location}</p>
                  </div>
                  <a href={s.link} target="_blank" rel="noopener noreferrer" className="text-xs text-green-400 hover:underline shrink-0">Privacy policy ↗</a>
                </div>
              ))}
            </div>
            <p className="mt-4">
              Where data is transferred outside the UK/EEA (e.g. to USA-based providers), we rely on
              Standard Contractual Clauses or the UK–US Data Bridge as the legal transfer mechanism.
            </p>
          </Section>

          <Divider />

          {/* 5 */}
          <Section title="5. How Long We Keep Your Data">
            <DataTable rows={[
              ["Account and profile data", "Until you delete your account"],
              ["Quotes and invoices", "Until you delete them or your account"],
              ["Usage logs and error reports", "90 days"],
              ["Email delivery logs", "30 days"],
              ["Backups", "Up to 30 days after deletion"],
            ]} twoCol />
          </Section>

          <Divider />

          {/* 6 */}
          <Section title="6. Your Rights Under UK GDPR">
            <p>You have the following rights regarding your personal data:</p>
            <div className="mt-4 space-y-3">
              {[
                { right: "Right of access", desc: "Request a copy of all personal data we hold about you." },
                { right: "Right to rectification", desc: "Ask us to correct inaccurate or incomplete data." },
                { right: "Right to erasure", desc: "Request deletion of your account and all associated data." },
                { right: "Right to data portability", desc: "Receive your data in a machine-readable format (CSV/JSON)." },
                { right: "Right to restrict processing", desc: "Ask us to limit how we use your data in certain circumstances." },
                { right: "Right to object", desc: "Object to processing based on legitimate interests (e.g. analytics)." },
                { right: "Right to withdraw consent", desc: "Withdraw consent for cookies or optional features at any time." },
              ].map((r) => (
                <div key={r.right} className="flex gap-3">
                  <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                  <div>
                    <span className="text-white font-medium">{r.right}:</span>{" "}
                    <span className="text-zinc-400">{r.desc}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4">
              To exercise any of these rights, email us at{" "}
              <a href="mailto:hello@getjobquotes.uk" className="text-green-400 hover:underline">hello@getjobquotes.uk</a>.
              We will respond within 30 days. We may need to verify your identity before processing your request.
            </p>
          </Section>

          <Divider />

          {/* 7 */}
          <Section title="7. Security">
            <p>We take reasonable technical and organisational measures to protect your data, including:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>All data in transit is encrypted using TLS 1.2+.</li>
              <li>All data at rest is encrypted by our database provider (Supabase/PostgreSQL).</li>
              <li>Row-level security ensures users can only access their own data.</li>
              <li>Authentication tokens are short-lived and rotated on use.</li>
              <li>We conduct periodic security reviews and promptly patch known vulnerabilities.</li>
            </ul>
            <p className="mt-4">
              In the event of a data breach that is likely to result in a risk to your rights and freedoms,
              we will notify affected users and the ICO within 72 hours of becoming aware.
            </p>
          </Section>

          <Divider />

          {/* 8 */}
          <Section title="8. Children">
            <p>
              GetJobQuotes is intended for use by adults (18+) for business purposes. We do not knowingly
              collect data from anyone under 18. If you believe a minor has created an account, please
              contact us and we will delete it promptly.
            </p>
          </Section>

          <Divider />

          {/* 9 */}
          <Section title="9. Complaints">
            <p>
              If you are unhappy with how we handle your data, please contact us first at{" "}
              <a href="mailto:hello@getjobquotes.uk" className="text-green-400 hover:underline">hello@getjobquotes.uk</a>.
            </p>
            <p className="mt-3">
              You also have the right to lodge a complaint with the UK Information Commissioner's Office (ICO):
            </p>
            <div className="mt-3 rounded-xl border border-zinc-800 px-4 py-3">
              <p className="text-white text-sm font-medium">Information Commissioner's Office</p>
              <p className="text-zinc-500 text-xs mt-1">
                Website: <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">ico.org.uk</a>
                {" "}· Helpline: 0303 123 1113
              </p>
            </div>
          </Section>

          <Divider />

          {/* 10 */}
          <Section title="10. Changes to This Policy">
            <p>
              We may update this Privacy Policy periodically. When we make material changes, we will
              notify you by email and update the "Last updated" date above. The latest version is always
              available at{" "}
              <a href="https://getjobquotes.uk/privacy" className="text-green-400 hover:underline">getjobquotes.uk/privacy</a>.
            </p>
          </Section>

          <Divider />

          <section>
            <h2 className="text-lg font-bold text-white mb-3">Contact Us</h2>
            <p>
              For any privacy-related questions or to exercise your rights, email:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-green-400 hover:underline">{CONTACT_EMAIL}</a>
            </p>
            <p className="mt-2 text-zinc-500">We aim to respond to all privacy requests within 5 business days.</p>
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
      <h2 className="text-lg font-bold text-white mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {children}
    </div>
  );
}

function DataTable({ rows, twoCol }: { rows: string[][]; twoCol?: boolean }) {
  return (
    <div className="mt-3 rounded-xl border border-zinc-800 overflow-hidden">
      {rows.map((row, i) => (
        <div key={i} className={`grid px-4 py-3 gap-4 text-xs ${twoCol ? "grid-cols-2" : "grid-cols-3"} ${i < rows.length - 1 ? "border-b border-zinc-800" : ""}`}>
          <span className="text-white font-medium">{row[0]}</span>
          <span className="text-zinc-400">{row[1]}</span>
          {!twoCol && <span className="text-zinc-500">{row[2]}</span>}
        </div>
      ))}
    </div>
  );
}

function Divider() {
  return <hr className="border-zinc-800" />;
}

function Footer() {
  return (
    <footer className="border-t border-zinc-900 px-6 py-6 flex flex-wrap gap-4 text-xs text-zinc-700 justify-center">
      <Link href="/" className="hover:text-zinc-400 transition">Home</Link>
      <Link href="/terms" className="hover:text-zinc-400 transition">Terms & Conditions</Link>
      <Link href="/status" className="hover:text-zinc-400 transition">Status</Link>
      <a href="mailto:hello@getjobquotes.uk" className="hover:text-zinc-400 transition">Contact</a>
    </footer>
  );
}
