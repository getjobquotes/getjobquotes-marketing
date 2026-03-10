"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import AdBanner from "@/components/AdBanner";

type Doc = {
  id: string; type: "quote" | "invoice"; number: string; client_name: string;
  client_email: string; total: number; status: string; created_at: string;
  description: string; vat: boolean; line_items: any[]; notes: string; paid_at: string | null;
};
type SortKey = "date_new" | "date_old" | "name_asc" | "name_desc" | "amount_high" | "amount_low";

function fmt(n: number) {
  if (n >= 1_000_000) return `£${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 10_000) return `£${(n / 1_000).toFixed(1)}k`;
  return `£${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function greeting(name: string | null) {
  const h = new Date().getHours();
  const n = name ? `, ${name.split(" ")[0]}` : "";
  return h < 12 ? `Good morning${n} ☀️` : h < 17 ? `Good afternoon${n} 👋` : `Good evening${n} 🌙`;
}

function DashboardInner() {
  const supabase = createClient();
  const router = useRouter();
  const params = useSearchParams();

  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState<string | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"quotes" | "invoices">("quotes");
  const [firstVisit, setFirstVisit] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("date_new");
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      setUser(user);

      const metaName = user.user_metadata?.full_name || user.user_metadata?.name;
      const emailName = user.email?.split("@")[0]?.replace(/[._]/g, " ")?.replace(/\b\w/g, (c: string) => c.toUpperCase());
      const n = metaName || emailName || null;
      setName(n);
      if (n) localStorage.setItem("gjq_display_name", n);
      if (user.email) localStorage.setItem("gjq_email", user.email);

      if (Date.now() - new Date(user.created_at).getTime() < 120_000) setFirstVisit(true);

      // Import demo quote if fresh
      const raw = localStorage.getItem("gjq_demo_import");
      if (raw) {
        try {
          const demo = JSON.parse(raw);
          const age = Date.now() - new Date(demo.savedAt).getTime();
          if (age < 3_600_000 && demo.form?.clientName) {
            const yes = window.confirm(`Import your demo quote for "${demo.form.clientName}" into your account?`);
            if (yes) {
              await supabase.from("documents").insert({
                user_id: user.id, type: "quote",
                number: "QUO-" + Date.now().toString().slice(-6),
                client_name: demo.form.clientName, client_email: demo.form.clientEmail || "",
                description: demo.form.description || "", vat: demo.form.vat || false,
                total: demo.total || 0, status: "pending",
                line_items: demo.lineItems || [], notes: demo.form.notes || "",
                signature_data: demo.sigData || null,
              });
            }
            localStorage.removeItem("gjq_demo_import");
          }
        } catch {}
      }

      const { data } = await supabase.from("documents").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setDocs(data || []);
      setLoading(false);
    };
    init();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this permanently?")) return;
    await supabase.from("documents").delete().eq("id", id);
    setDocs((p) => p.filter((d) => d.id !== id));
  };

  const handlePaid = async (doc: Doc) => {
    setMarkingPaid(doc.id);
    await supabase.from("documents").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", doc.id);
    setDocs((p) => p.map((d) => d.id === doc.id ? { ...d, status: "paid" } : d));
    setMarkingPaid(null);
  };

  const handleConvert = async (doc: Doc) => {
    const num = "INV-" + Date.now().toString().slice(-6);
    await supabase.from("documents").insert({
      user_id: user.id, type: "invoice", number: num,
      client_name: doc.client_name, client_email: doc.client_email,
      description: doc.description, vat: doc.vat, total: doc.total,
      status: "pending", line_items: doc.line_items || [], notes: doc.notes || "",
      linked_quote_id: doc.id,
    });
    const { data } = await supabase.from("documents").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setDocs(data || []); setTab("invoices");
  };

  const quotes = docs.filter((d) => d.type === "quote");
  const invoices = docs.filter((d) => d.type === "invoice");
  const totalInvoiced = invoices.reduce((s, d) => s + d.total, 0);
  const pendingCount = invoices.filter((d) => d.status === "pending").length;
  const overdueCount = invoices.filter((d) => d.status === "pending" && new Date(d.created_at) < new Date(Date.now() - 30 * 86400000)).length;

  const list = (tab === "quotes" ? quotes : invoices)
    .filter((d) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return d.client_name?.toLowerCase().includes(q) || d.number?.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sort === "date_old") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sort === "name_asc") return a.client_name.localeCompare(b.client_name);
      if (sort === "name_desc") return b.client_name.localeCompare(a.client_name);
      if (sort === "amount_high") return b.total - a.total;
      if (sort === "amount_low") return a.total - b.total;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="min-h-screen bg-black text-white">
      <TopNav />
      <AdBanner className="border-b border-zinc-900" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Greeting */}
        <div className="mb-7">
          {firstVisit
            ? <><h1 className="text-2xl sm:text-3xl font-bold">👋 Welcome{name ? `, ${name.split(" ")[0]}` : ""}!</h1><p className="text-zinc-400 text-sm mt-1">Your account is ready. Create your first quote below.</p></>
            : <><h1 className="text-2xl sm:text-3xl font-bold">{greeting(name)}</h1><p className="text-zinc-400 text-sm mt-1">Here's your overview.</p></>
          }
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
          {[
            { label: "Quotes", value: loading ? "—" : quotes.length },
            { label: "Invoices", value: loading ? "—" : invoices.length },
            { label: "Total Invoiced", value: loading ? "—" : fmt(totalInvoiced) },
            {
              label: "Pending",
              value: loading ? "—" : pendingCount,
              sub: overdueCount > 0 ? `${overdueCount} overdue` : "invoices",
              alert: overdueCount > 0,
            },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl border p-4 sm:p-5 ${(s as any).alert ? "border-red-500/30 bg-red-500/5" : "border-zinc-800 bg-zinc-900/50"}`}>
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-xl sm:text-2xl font-bold truncate">{s.value}</p>
              {(s as any).sub && <p className={`text-xs mt-0.5 ${(s as any).alert ? "text-red-400" : "text-zinc-600"}`}>{(s as any).sub}</p>}
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="flex gap-2 mb-7 flex-wrap">
          <Link href="/profile" className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900/50 text-xs text-zinc-400 hover:text-white hover:border-zinc-600 transition">🏢 Profile</Link>
          <Link href="/customers" className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900/50 text-xs text-zinc-400 hover:text-white hover:border-zinc-600 transition">👥 Customers</Link>
        </div>

        {/* Empty state */}
        {!loading && docs.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center mb-8">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-xl font-bold mb-2">No quotes yet</h2>
            <p className="text-zinc-400 text-sm mb-6 max-w-xs mx-auto">Create your first professional quote in under 2 minutes.</p>
            <Link href="/tool" className="inline-block px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-sm transition">Create First Quote →</Link>
          </div>
        )}

        {/* Tabs + documents */}
        {docs.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-full">
                {(["quotes", "invoices"] as const).map((t) => (
                  <button key={t} onClick={() => { setTab(t); setSearch(""); }}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition ${tab === t ? "bg-green-600 text-white" : "text-zinc-400 hover:text-white"}`}>
                    {t} ({t === "quotes" ? quotes.length : invoices.length})
                  </button>
                ))}
              </div>
              <Link href="/tool" className="px-4 py-2 text-sm font-bold bg-green-600 hover:bg-green-500 rounded-xl transition">+ New Quote</Link>
            </div>

            {/* Search + sort */}
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">🔍</span>
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search ${tab} by client, ref or description...`}
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition" />
                {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white leading-none text-lg">×</button>}
              </div>
              <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}
                className="px-3 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-white text-sm outline-none focus:border-green-500 transition">
                <option value="date_new">Newest first</option>
                <option value="date_old">Oldest first</option>
                <option value="name_asc">Client A → Z</option>
                <option value="name_desc">Client Z → A</option>
                <option value="amount_high">Amount ↓</option>
                <option value="amount_low">Amount ↑</option>
              </select>
            </div>

            {search && <p className="text-xs text-zinc-600 mb-3">{list.length} result{list.length !== 1 ? "s" : ""} for "{search}"</p>}

            <div className="space-y-2">
              {list.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center">
                  <p className="text-zinc-500 text-sm">{search ? `No ${tab} match "${search}"` : tab === "invoices" ? "No invoices yet — convert a quote." : "No quotes."}</p>
                </div>
              ) : list.map((doc) => {
                const isOverdue = doc.type === "invoice" && doc.status === "pending" && new Date(doc.created_at) < new Date(Date.now() - 30 * 86400000);
                return (
                  <div key={doc.id} className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 transition ${isOverdue ? "border-red-500/20 bg-red-500/5 hover:border-red-500/40" : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"}`}>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white truncate">{doc.client_name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isOverdue ? "bg-red-500/20 text-red-400" : doc.status === "paid" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                          {isOverdue ? "overdue" : doc.status}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 mt-0.5">{doc.number} · {new Date(doc.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                      <span className="text-sm font-bold text-green-400">{fmt(doc.total)}</span>
                      <Link href={`/tool?id=${doc.id}`} className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white transition">View</Link>
                      {doc.type === "quote" && <button onClick={() => handleConvert(doc)} className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-green-500/60 text-zinc-300 hover:text-green-400 transition">→ Invoice</button>}
                      {doc.type === "invoice" && doc.status !== "paid" && (
                        <button onClick={() => handlePaid(doc)} disabled={markingPaid === doc.id}
                          className="text-xs px-3 py-1.5 rounded-lg border border-green-700/50 hover:bg-green-600 text-green-400 hover:text-white transition disabled:opacity-40">
                          {markingPaid === doc.id ? "..." : "✓ Paid"}
                        </button>
                      )}
                      <button onClick={() => handleDelete(doc.id)} className="text-xs px-2 py-1.5 text-zinc-700 hover:text-red-400 transition">✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="mt-12 pt-6 border-t border-zinc-900 flex flex-wrap gap-4 text-xs text-zinc-700">
          <Link href="/terms" className="hover:text-zinc-400 transition">Terms</Link>
          <Link href="/privacy" className="hover:text-zinc-400 transition">Privacy</Link>
          <Link href="/status" className="hover:text-zinc-400 transition">Status</Link>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return <Suspense fallback={<div className="min-h-screen bg-black" />}><DashboardInner /></Suspense>;
}
