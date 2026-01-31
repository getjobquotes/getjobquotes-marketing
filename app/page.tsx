"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Something went wrong");
      }

      router.push(`/thanks?name=${encodeURIComponent(name || "there")}`);
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message);
    } finally {
      setStatus("idle");
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      {/* HEADER / BRAND */}
      <header className="px-6 pt-10 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          <span className="text-green-500">GetJobQuotes</span>
          <span className="text-neutral-400">.app</span>
        </h1>
      </header>

      {/* HERO */}
      <section className="flex flex-col items-center justify-center px-6 py-24 text-center">
        <span className="mb-4 inline-block rounded-full bg-green-900/40 px-4 py-1 text-sm font-medium text-green-400">
          Built for UK trades • Quotes in minutes
        </span>

        <h2 className="max-w-3xl text-4xl md:text-5xl font-bold leading-tight">
          Create professional job quotes{" "}
          <span className="text-green-500">in under 2 minutes</span>
        </h2>

        <p className="mt-6 max-w-xl text-lg text-neutral-400">
          Quote on-site, send instantly, and get paid faster — without paper,
          WhatsApp back-and-forth, or messy notes.
        </p>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="mt-12 w-full max-w-md rounded-2xl bg-neutral-900 p-8 shadow-2xl border border-neutral-800"
        >
          <input
            type="text"
            placeholder="Your name or business name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-4 w-full rounded-lg bg-neutral-800 border border-neutral-700 px-4 py-3 text-white placeholder-neutral-500 focus:border-green-500 focus:outline-none"
          />

          <input
            type="email"
            required
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 w-full rounded-lg bg-neutral-800 border border-neutral-700 px-4 py-3 text-white placeholder-neutral-500 focus:border-green-500 focus:outline-none"
          />

          {status === "error" && (
            <p className="mb-3 text-sm text-red-400">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-lg bg-green-600 py-3 font-semibold text-black hover:bg-green-500 disabled:opacity-60"
          >
            {status === "loading" ? "Submitting…" : "Join the waiting list"}
          </button>

          <p className="mt-3 text-center text-xs text-neutral-500">
            No spam. Just early access and updates.
          </p>
        </form>
      </section>

      {/* INFO */}
      <section className="bg-neutral-900 py-24 px-6">
        <div className="mx-auto max-w-4xl space-y-16 text-center">
          <div>
            <h3 className="text-2xl font-semibold mb-2">Quote on-site</h3>
            <p className="text-neutral-400">
              Build clean, professional quotes while you’re still at the job.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-semibold mb-2">Send instantly</h3>
            <p className="text-neutral-400">
              No screenshots, no WhatsApp chains, no confusion.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-semibold mb-2">Get paid faster</h3>
            <p className="text-neutral-400">
              Clear quotes build trust and speed up payment.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-green-600 py-20 text-center px-6">
        <h3 className="text-3xl font-bold mb-4 text-black">
          Join the waiting list today
        </h3>
        <p className="mb-6 text-green-900">
          Be first to access the fastest quoting tool for trades.
        </p>
        <a
          href="#"
          className="inline-block rounded-lg bg-black px-6 py-3 font-semibold text-green-500 hover:bg-neutral-900"
        >
          Get early access
        </a>
      </section>
    </main>
  );
}
