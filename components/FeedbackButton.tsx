"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function FeedbackButton() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!message.trim()) { setError("Please describe the problem."); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/bug-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, page_url: pathname }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) { setSent(true); setTimeout(() => { setOpen(false); setSent(false); setMessage(""); }, 2000); }
    else setError(data.error || "Something went wrong");
  };

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="text-xs text-zinc-700 hover:text-zinc-500 transition">
        🐛 Report a problem
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
            {sent ? (
              <div className="text-center py-4">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-sm text-green-400 font-medium">Thanks — report received!</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white">Report a problem</h3>
                  <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white text-xl">×</button>
                </div>
                <p className="text-xs text-zinc-500 mb-3">
                  Describe what went wrong and we will look into it.
                </p>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="What happened? What were you trying to do?"
                  rows={4}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition resize-none mb-3"
                />
                {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
                <div className="flex gap-2">
                  <button onClick={handleSubmit} disabled={loading}
                    className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition disabled:opacity-50">
                    {loading ? "Sending..." : "Send Report"}
                  </button>
                  <button onClick={() => setOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white text-sm transition">
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
