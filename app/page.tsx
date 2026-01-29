"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    const cleanEmail = email.trim().toLowerCase();

    // Basic validation (we’ll tighten later)
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setStatus("error");
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Something went wrong.");
      }

      router.push("/thanks");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message || "Something went wrong. Please try again.");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <main className="min-h-screen">
      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="h-full w-full bg-gradient-to-b from-white via-gray-50 to-white" />
          <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_20%,rgba(0,0,0,0.08),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(0,0,0,0.06),transparent_40%)]" />
        </div>

        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="max-w-3xl">
            <p className="inline-flex items-center rounded-full border px-3 py-1 text-sm">
              Built for UK trades • Quotes in minutes
            </p>

            <h1 className="mt-6 text-5xl font-semibold tracking-tight">
              Create professional job quotes in under 2 minutes.
            </h1>

            <p className="mt-5 text-lg text-gray-700">
              Quote on-site, send instantly, and get paid faster — without paper, WhatsApp back-and-forth, or messy pricing notes.
            </p>

            {/* Email capture */}
            <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Enter your email"
                className="h-12 w-full rounded-md border px-4 text-base outline-none focus:ring-2 focus:ring-black/20 sm:max-w-md"
              />
              <button
                disabled={status === "loading"}
                className="h-12 rounded-md bg-black px-6 text-base font-medium text-white disabled:opacity-60"
              >
                {status === "loading" ? "Submitting..." : "Get early access"}
              </button>
            </form>

            {errorMsg ? <p className="mt-3 text-sm text-red-600">{errorMsg}</p> : null}

            <p className="mt-3 text-sm text-gray-500">No spam. Just early access and updates.</p>
          </div>
        </div>
      </section>

      {/* SECTION 2: Pain points */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-semibold tracking-tight">Quoting jobs shouldn’t be this hard.</h2>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <Card title="Paper quotes">
            Writing quotes on paper looks unprofessional and gets lost.
          </Card>
          <Card title="WhatsApp pricing">
            Scattered messages make it hard to track what you promised.
          </Card>
          <Card title="Late payments">
            A clean quote + invoice flow helps you get paid faster.
          </Card>
        </div>
      </section>

      {/* SECTION 3: What you get */}
      <section className="border-t bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-semibold tracking-tight">Built to feel simple on-site.</h2>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Card title="Fast templates">Pick a job type, enter details, send.</Card>
            <Card title="Professional look">Your logo, your style, every time.</Card>
            <Card title="Track everything">See what’s sent, accepted, and paid.</Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-gray-500">
          © {new Date().getFullYear()} GetJobQuotes. All rights reserved.
        </div>
      </footer>
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-gray-600">{children}</p>
    </div>
  );
}

