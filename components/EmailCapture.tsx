"use client";
import { useState } from "react";

export default function EmailCapture({ source = "landing_page" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email.includes("@")) { setError("Please enter a valid email."); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) setDone(true);
    else setError(data.error || "Something went wrong.");
  };

  if (done) return (
    <div className="flex items-center justify-center gap-2 text-green-400 text-sm font-medium py-2">
      <span>✅</span><span>You are on the list — we will be in touch!</span>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          className="flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition" />
        <button onClick={handleSubmit} disabled={loading}
          className="px-5 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition disabled:opacity-50 whitespace-nowrap">
          {loading ? "Joining..." : "Notify Me"}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
    </div>
  );
}
