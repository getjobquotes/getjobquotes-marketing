"use client";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import AppFooter from "@/components/AppFooter";
import { usePlan } from "@/lib/usePlan";
import UpgradePrompt from "@/components/UpgradePrompt";
import OnboardingTour from "@/components/OnboardingTour";

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
  return h < 12 ? `Good morning${n} ☀️` : h < 17 ? `Good afternoon${n} 👋` : `Good evening${n} 🌙`;
};

export default function DashboardPage() {
  const supabase = createClient();
  const auth = useAuthGuard();
  const plan = usePlan(auth.status === "authenticated" ? auth.user.id : null);

  const [docs, setDocs] = useState<Doc[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"quotes" | "invoices">("quotes");
  const [search, setSearch] = useState("");
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showUpgradedBanner, setShowUpgradedBanner] = useState(() =>
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("upgraded") === "true"
  );

  const name = auth.status === "authenticated"
    ? auth.user.user_metadata?.full_name ||
      auth.user.user_metadata?.name ||
      auth.user.email?.split("@")[0]?.replace(/[._]/g, " ") || null
    : null;

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

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} items permanently?`)) return;
    setBulkDeleting(true);
    await supabase.from("documents").delete().in("id", Array.from(selected));
    setDocs(p => p.filter(d => !selected.has(d.id)));
    setSelected(new Set());
    setBulkDeleting(false);
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

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (auth.status === "loading") return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-zinc-600 text-sm animate-pulse">Loading...</p>
    </div>
  );
  if (auth.status === "unauthenticated") return null;

  const quotes = docs.filter(d => d.type === "quote");
  const invoices = docs.filter(d => d.type === "invoice");
  const totalInvoiced = invoices.reduce((s, d) => s + (d.total || 0), 0);
  const pending = invoices.filter(d => d.status === "pending").length;
  const overdue = invoices.filter(d =>
    d.status === "pending" &&
    new Date(d.created_at) < new Date(Date.now() - 30 * 86400000)
  ).length;

  const activeList = (tab === "quotes" ? quotes : invoices);

  const filtered = activeList.filter(d => {
    if (!search) return true;
    const q = search.toLowerCase();
    return d.client_name?.toLowerCase().includes(q) || d.number?.toLowerCase().includes(q);
  });

  // Recently viewed — last 3 from current tab
  const recent = activeList.slice(0, 3);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <TopNav />
      {auth.status === "authenticated" && <OnboardingTour userId={auth.user.id} />}

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">{greet(name)}</h1>
          <p className="text-zinc-500 text-sm mt-1">Here's your overview.</p>
        </div>

        {/* Banners */}
        {showUpgradedBanner && (
          <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>🎉</span>
              <p className="text-sm text-green-400 font-medium">You're now on Pro — unlimited quotes, no ads!</p>
            </div>
            <button onClick={() => setShowUpgradedBanner(false)} className="text-zinc-500 hover:text-white text-lg">×</button>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            ⚠️ {error}
          </div>
        )}

        {/* Plan bar */}
        {!plan.loading && (
          <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {plan.isPro ? (
                <>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-600/20 text-green-400 border border-green-600/30 font-semibold">PRO</span>
                  <span className="text-xs text-zinc-500">Unlimited quotes</span>
                </>
              ) : (
                <>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 font-semibold">FREE</span>
                  <span className="text-xs text-zinc-500">{plan.quotesThisMonth}/5 quotes this month</span>
                </>
              )}
            </div>
            {!plan.isPro && (
              <Link href="/pricing" className="text-xs text-green-400 hover:text-green-300 font-medium transition">
                Upgrade to Pro →
              </Link>
            )}
          </div>
        )}

        {/* Stats */}
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

        {/* Quick actions */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Link href="/tool" className="px-4 py-2.5 text-sm font-bold bg-green-600 hover:bg-green-500 rounded-xl transition">+ New Quote</Link>
          <Link href="/profile" className="px-4 py-2.5 text-sm border border-zinc-800 hover:border-zinc-600 rounded-xl text-zinc-400 hover:text-white transition">🏢 Profile</Link>
          <Link href="/customers" className="px-4 py-2.5 text-sm border border-zinc-800 hover:border-zinc-600 rounded-xl text-zinc-400 hover:text-white transition">👥 Customers</Link>
          <Link href="/help" className="px-4 py-2.5 text-sm border border-zinc-800 hover:border-zinc-600 rounded-xl text-zinc-400 hover:text-white transition">❓ Help</Link>
        </div>

        {/* Empty state */}
        {!docsLoading && docs.length === 0 && !error && (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-xl font-bold mb-2">No quotes yet</h2>
            <p className="text-zinc-400 text-sm mb-6">Create your first professional quote in under 2 minutes.</p>
            <Link href="/tool" className="inline-block px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-sm transition">
              Create First Quote →
            </Link>
          </div>
        )}

        {!docsLoading && docs.length > 0 && (
          <>
            {/* Tabs */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-full">
                {(["quotes", "invoices"] as const).map(t => (
                  <button key={t} onClick={() => { setTab(t); setSearch(""); setSelected(new Set()); }}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition ${tab === t ? "bg-green-600 text-white" : "text-zinc-400 hover:text-white"}`}>
                    {t} ({t === "quotes" ? quotes.length : invoices.length})
                  </button>
                ))}
              </div>
              <Link href="/tool" className="px-4 py-2 text-sm font-bold bg-green-600 hover:bg-green-500 rounded-xl transition">+ New</Link>
            </div>

            {/* Search — prominent */}
            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">🔍</span>
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setSelected(new Set()); }}
                placeholder={`Search ${tab} by client name or number...`}
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-zinc-700 bg-zinc-900 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition"
              />
              {search && (
                <button onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-lg">×</button>
              )}
            </div>

            {/* Bulk action bar */}
            {selected.size > 0 && (
              <div className="mb-3 rounded-xl border border-red-900/30 bg-red-500/5 px-4 py-2.5 flex items-center justify-between">
                <span className="text-sm text-zinc-300">{selected.size} selected</span>
                <div className="flex gap-2">
                  <button onClick={() => setSelected(new Set())}
                    className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white transition">
                    Clear
                  </button>
                  <button onClick={handleBulkDelete} disabled={bulkDeleting}
                    className="text-xs px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white transition disabled:opacity-50">
                    {bulkDeleting ? "Deleting..." : `Delete ${selected.size}`}
                  </button>
                </div>
              </div>
            )}

            {/* Recently viewed — only when not searching */}
            {!search && recent.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-zinc-600 uppercase tracking-widest mb-2 px-1">Recent</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {recent.map(doc => (
                    <Link key={doc.id} href={`/tool?id=${doc.id}`}
                      className="shrink-0 rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2 hover:border-zinc-600 transition min-w-[140px]">
                      <p className="text-xs font-semibold text-white truncate">{doc.client_name || "—"}</p>
                      <p className="text-xs text-zinc-600 mt-0.5">{fmt(doc.total)}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* List */}
            <div className="space-y-2">
              {filtered.length === 0 ? (
                <p className="text-center text-zinc-600 text-sm py-8">
                  {search ? `No ${tab} match "${search}"` : `No ${tab} yet.`}
                </p>
              ) : filtered.map(doc => {
                const isOverdue = doc.type === "invoice" && doc.status === "pending" &&
                  new Date(doc.created_at) < new Date(Date.now() - 30 * 86400000);
                const isSelected = selected.has(doc.id);

                return (
                  <div key={doc.id}
                    className={`rounded-2xl border px-4 py-3.5 transition ${
                      isSelected ? "border-green-600/50 bg-green-600/5" :
                      isOverdue ? "border-red-500/20 bg-red-500/5" :
                      "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                    }`}>
                    <div className="flex items-start justify-between gap-3">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleSelect(doc.id)}
                        className={`mt-0.5 w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition ${
                          isSelected ? "bg-green-600 border-green-600" : "border-zinc-700 hover:border-green-500"
                        }`}>
                        {isSelected && <span className="text-white text-[10px]">✓</span>}
                      </button>

                      <div className="min-w-0 flex-1">
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

                    <div className="flex gap-2 mt-3 flex-wrap pl-7">
                      <Link href={`/tool?id=${doc.id}`}
                        className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white transition">
                        Edit
                      </Link>
                      {doc.type === "quote" && (
                        <button onClick={() => handleConvert(doc)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-green-500/50 text-zinc-300 hover:text-green-400 transition">
                          → Invoice
                        </button>
                      )}
                      {doc.type === "invoice" && doc.status !== "paid" && (
                        <button onClick={() => handlePaid(doc)} disabled={markingPaid === doc.id}
                          className="text-xs px-3 py-1.5 rounded-lg border border-green-700/40 hover:bg-green-600 text-green-400 hover:text-white transition disabled:opacity-40">
                          {markingPaid === doc.id ? "…" : "✓ Mark Paid"}
                        </button>
                      )}
                      <button onClick={() => handleDelete(doc.id)}
                        className="text-xs px-2 py-1.5 text-zinc-700 hover:text-red-400 transition ml-auto">✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <AppFooter />
    </div>
  );
}
