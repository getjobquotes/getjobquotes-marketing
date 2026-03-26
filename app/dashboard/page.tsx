"use client";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import OnboardingTour from "@/components/OnboardingTour";
import { usePlan } from "@/lib/usePlan";
import UpgradePrompt from "@/components/UpgradePrompt";
import AdBanner from "@/components/AdBanner";

type Doc = {
  id: string; type: string; number: string; client_name: string;
  total: number; status: string; created_at: string;
  description: string; vat: boolean; line_items: any[];
  notes: string; paid_at: string | null; client_email: string;
};

const fmt = (n: number) => {
  const v = n || 0;
  if (v >= 1_000_000) return `£${(v / 1_000_000).toFixed(1)}m`;
  if (v >= 1_000) return `£${(v / 1_000).toFixed(1)}k`;
  return `£${v.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`;
};
const greet = (name: string | null) => {
  const h = new Date().getHours();
  const n = name ? `, ${name.split(" ")[0]}` : "";
  return h < 12 ? `Good morning${n} ☀️`
    : h < 17 ? `Good afternoon${n} 👋`
    : `Good evening${n} 🌙`;
};

export default function DashboardPage() {
  const supabase = createClient();
  const auth = useAuthGuard();
  const plan = usePlan(auth.status === "authenticated" ? auth.user.id : null); // ← handles all session validation

  const [docs, setDocs] = useState<Doc[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [showUpgradedBanner, setShowUpgradedBanner] = useState(() =>
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("upgraded") === "true"
  );
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"quotes" | "invoices">("quotes");
  const [search, setSearch] = useState("");
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);

  const name = auth.status === "authenticated"
    ? auth.user.user_metadata?.full_name ||
      auth.user.user_metadata?.name ||
      auth.user.email?.split("@")[0]?.replace(/[._]/g, " ") || null
    : null;

  // Load docs only once auth is confirmed valid
  useEffect(() => {
    if (auth.status !== "authenticated") return;

    supabase
      .from("documents")
      .select("*")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (err) setError(`${err.message} — run the SQL migration in Supabase`);
        else setDocs(data || []);
        setDocsLoading(false);
      });
  }, [auth.status]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete permanently?")) return;
    await supabase.from("documents").delete().eq("id", id);
    setDocs(p => p.filter(d => d.id !== id));
  };

  const handlePaid = async (doc: Doc) => {
    setMarkingPaid(doc.id);
    await supabase.from("documents")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", doc.id);
    setDocs(p => p.map(d => d.id === doc.id ? { ...d, status: "paid" } : d));
    setMarkingPaid(null);
  };

  const handleConvert = async (doc: Doc) => {
    if (auth.status !== "authenticated") return;
    const { data: nd } = await supabase.from("documents").insert({
      user_id: auth.user.id, type: "invoice",
      number: "INV-" + Date.now().toString().slice(-6),
      client_name: doc.client_name, client_email: doc.client_email,
      description: doc.description, vat: doc.vat, total: doc.total,
      status: "pending", line_items: doc.line_items || [],
      notes: doc.notes || "", linked_quote_id: doc.id,
    }).select().single();
    if (nd) { setDocs(p => [nd, ...p]); setTab("invoices"); }
  };

  // Show loading while validating session
  if (auth.status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-600 text-sm animate-pulse">Loading...</p>
      </div>
    );
  }

  // Guard: should never reach here due to redirect in hook
  // but just in case
  if (auth.status === "unauthenticated") return null;

  const quotes = docs.filter(d => d.type === "quote");
  const invoices = docs.filter(d => d.type === "invoice");
  const totalInvoiced = invoices.reduce((s, d) => s + (d.total || 0), 0);
  const pending = invoices.filter(d => d.status === "pending").length;
  const overdue = invoices.filter(d =>
    d.status === "pending" &&
    new Date(d.created_at) < new Date(Date.now() - 30 * 86400000)
  ).length;

  const list = (tab === "quotes" ? quotes : invoices)
    .filter(d => {
      if (!search) return true;
      const q = search.toLowerCase();
      return d.client_name?.toLowerCase().includes(q) || d.number?.toLowerCase().includes(q);
    });

  return (
    <div className="min-h-screen bg-black text-white">
      <TopNav />
      {auth.status === "authenticated" && <OnboardingTour userId={auth.user.id} />}
      <AdBanner className="border-b border-zinc-900" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">{greet(name)}</h1>
          <p className="text-zinc-500 text-sm mt-1">Here's your overview.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            ⚠️ {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: "QUOTES", value: docsLoading ? "…" : quotes.length },
            { label: "INVOICES", value: docsLoading ? "…" : invoices.length },
            { label: "TOTAL INVOICED", value: docsLoading ? "…" : fmt(totalInvoiced) },
            { label: "PENDING", value: docsLoading ? "…" : pending, sub: overdue > 0 ? `${overdue} overdue` : "invoices", alert: overdue > 0 },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl border p-4 ${(s as any).alert ? "border-red-500/30 bg-red-500/5" : "border-zinc-800 bg-zinc-900/50"}`}>
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
              {(s as any).sub && <p className={`text-xs mt-1 ${(s as any).alert ? "text-red-400" : "text-zinc-600"}`}>{(s as any).sub}</p>}
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          <Link href="/tool" className="px-4 py-2.5 text-sm font-bold bg-green-600 hover:bg-green-500 rounded-xl transition">+ New Quote</Link>
          <Link href="/profile" className="px-4 py-2.5 text-sm border border-zinc-800 hover:border-zinc-600 rounded-xl text-zinc-400 hover:text-white transition">🏢 Profile</Link>
          <Link href="/customers" className="px-4 py-2.5 text-sm border border-zinc-800 hover:border-zinc-600 rounded-xl text-zinc-400 hover:text-white transition">👥 Customers</Link>
        </div>

        {!docsLoading && docs.length === 0 && !error && (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-xl font-bold mb-2">No quotes yet</h2>
            <p className="text-zinc-400 text-sm mb-6">Create your first professional quote in under 2 minutes.</p>
            <Link href="/tool" className="inline-block px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-sm transition">Create First Quote →</Link>
          </div>
        )}

        {!docsLoading && docs.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-full">
                {(["quotes", "invoices"] as const).map(t => (
                  <button key={t} onClick={() => { setTab(t); setSearch(""); }}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition ${tab === t ? "bg-green-600 text-white" : "text-zinc-400 hover:text-white"}`}>
                    {t} ({t === "quotes" ? quotes.length : invoices.length})
                  </button>
                ))}
              </div>
              <Link href="/tool" className="px-4 py-2 text-sm font-bold bg-green-600 hover:bg-green-500 rounded-xl transition">+ New</Link>
            </div>

            <div className="relative mb-3">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={`Search ${tab}...`}
                className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition" />
              {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-lg">×</button>}
            </div>

            <div className="space-y-2">
              {list.length === 0 ? (
                <p className="text-center text-zinc-600 text-sm py-8">No {tab} found.</p>
              ) : list.map(doc => {
                const isOverdue = doc.type === "invoice" && doc.status === "pending" &&
                  new Date(doc.created_at) < new Date(Date.now() - 30 * 86400000);
                return (
                  <div key={doc.id} className={`rounded-2xl border px-4 py-3.5 transition ${isOverdue ? "border-red-500/20 bg-red-500/5" : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold">{doc.client_name || "—"}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            isOverdue ? "bg-red-500/20 text-red-400" :
                            doc.status === "paid" ? "bg-green-500/10 text-green-400" :
                            "bg-yellow-500/10 text-yellow-400"
                          }`}>{isOverdue ? "overdue" : doc.status}</span>
                        </div>
                        <p className="text-xs text-zinc-600 mt-0.5">
                          {doc.number} · {new Date(doc.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-green-400 shrink-0">{fmt(doc.total)}</span>
                    </div>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <Link href={`/tool?id=${doc.id}`} className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white transition">Edit</Link>
                      {doc.type === "quote" && (
                        <button onClick={() => handleConvert(doc)} className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-green-500/50 text-zinc-300 hover:text-green-400 transition">→ Invoice</button>
                      )}
                      {doc.type === "invoice" && doc.status !== "paid" && (
                        <button onClick={() => handlePaid(doc)} disabled={markingPaid === doc.id}
                          className="text-xs px-3 py-1.5 rounded-lg border border-green-700/40 hover:bg-green-600 text-green-400 hover:text-white transition disabled:opacity-40">
                          {markingPaid === doc.id ? "…" : "✓ Mark Paid"}
                        </button>
                      )}
                      <button onClick={() => handleDelete(doc.id)} className="text-xs px-2 py-1.5 text-zinc-700 hover:text-red-400 transition ml-auto">✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="mt-10 pt-6 border-t border-zinc-900 flex flex-wrap gap-4 text-xs text-zinc-700">
          <Link href="/terms" className="hover:text-zinc-400 transition">Terms</Link>
          <Link href="/privacy" className="hover:text-zinc-400 transition">Privacy</Link>
          <Link href="/status" className="hover:text-zinc-400 transition">Status</Link>
        </div>
      </div>
    </div>
  );
}
