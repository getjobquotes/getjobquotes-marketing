"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import TopNav from "@/components/TopNav";

type Document = {
  id: string;
  type: "quote" | "invoice";
  number: string;
  client_name: string;
  total: number;
  status: string;
  created_at: string;
  description: string;
  labour_cost: number;
  materials_cost: number;
  vat: boolean;
  client_email: string;
};

function getGreeting(name: string | null) {
  const hour = new Date().getHours();
  const first = name?.split(" ")[0] || null;
  const suffix = first ? `, ${first}` : "";
  if (hour < 12) return `Good morning${suffix} ☀️`;
  if (hour < 17) return `Good afternoon${suffix} 👋`;
  return `Good evening${suffix} 🌙`;
}

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"quotes" | "invoices">("quotes");
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      setUser(user);

      const metaName = user.user_metadata?.full_name || user.user_metadata?.name;
      const emailName = user.email
        ?.split("@")[0]
        ?.replace(/[._]/g, " ")
        ?.replace(/\b\w/g, (c: string) => c.toUpperCase());
      setDisplayName(metaName || emailName || null);

      const name = metaName || emailName || null;
      if (name) localStorage.setItem("gjq_display_name", name);
      if (user.email) localStorage.setItem("gjq_email", user.email);

      const created = new Date(user.created_at).getTime();
      if (Date.now() - created < 120000) setIsFirstVisit(true);

      const { data } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setDocs(data || []);
      setLoading(false);
    };
    init();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    await supabase.from("documents").delete().eq("id", id);
    setDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const handleConvert = async (doc: Document) => {
    const invoiceNumber = "INV-" + Date.now().toString().slice(-6);
    const { error } = await supabase.from("documents").insert({
      user_id: user.id,
      type: "invoice",
      number: invoiceNumber,
      client_name: doc.client_name,
      client_email: doc.client_email,
      description: doc.description,
      labour_cost: doc.labour_cost,
      materials_cost: doc.materials_cost,
      vat: doc.vat,
      total: doc.total,
      status: "pending",
      linked_quote_id: doc.id,
    });
    if (!error) {
      const { data } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setDocs(data || []);
      setActiveTab("invoices");
    }
  };

  const quotes = docs.filter((d) => d.type === "quote");
  const invoices = docs.filter((d) => d.type === "invoice");
  const totalInvoiced = invoices.reduce((sum, d) => sum + d.total, 0);
  const displayed = activeTab === "quotes" ? quotes : invoices;

  return (
    <div className="min-h-screen bg-black text-white">
      <TopNav />

      <div className="max-w-5xl mx-auto px-6 py-10">

        <div className="mb-8">
          {isFirstVisit ? (
            <>
              <h1 className="text-3xl font-bold mb-1">
                👋 Welcome to GetJobQuotes{displayName ? `, ${displayName.split(" ")[0]}` : ""}!
              </h1>
              <p className="text-zinc-400 text-sm">Your account is all set up. Create your first quote below — it takes under 2 minutes.</p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-1">{getGreeting(displayName)}</h1>
              <p className="text-zinc-400 text-sm">Here's your quote and invoice overview.</p>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Quotes", value: quotes.length },
            { label: "Invoices", value: invoices.length },
            { label: "Total Invoiced", value: `£${totalInvoiced.toLocaleString("en-GB", { minimumFractionDigits: 2 })}` },
            { label: "Pending", value: invoices.filter((d) => d.status === "pending").length, sub: "invoices" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-white">{loading ? "—" : s.value}</p>
              {s.sub && <p className="text-xs text-zinc-600 mt-0.5">{s.sub}</p>}
            </div>
          ))}
        </div>

        {!loading && docs.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-14 text-center mb-10">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-xl font-semibold mb-2">No quotes yet</h2>
            <p className="text-zinc-400 text-sm mb-6 max-w-xs mx-auto">
              Create your first quote and download a professional PDF in minutes.
            </p>
            <Link href="/tool"
              className="inline-block px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-semibold text-sm transition">
              Create First Quote
            </Link>
          </div>
        )}

        {docs.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-5">
              <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-full">
                {(["quotes", "invoices"] as const).map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-5 py-1.5 rounded-full text-sm font-semibold capitalize transition ${
                      activeTab === tab ? "bg-green-600 text-white" : "text-zinc-400 hover:text-white"
                    }`}>
                    {tab} ({tab === "quotes" ? quotes.length : invoices.length})
                  </button>
                ))}
              </div>
              <Link href="/tool"
                className="px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-500 rounded-lg transition">
                + New Quote
              </Link>
            </div>

            <div className="space-y-2">
              {displayed.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-800 p-10 text-center">
                  <p className="text-zinc-500 text-sm">
                    {activeTab === "invoices" ? "No invoices yet — convert a quote to create one." : "No quotes yet."}
                  </p>
                </div>
              ) : (
                displayed.map((doc) => (
                  <div key={doc.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 px-5 py-4 hover:border-zinc-700 transition">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-sm font-semibold text-white truncate">{doc.client_name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          doc.status === "pending" ? "bg-yellow-500/10 text-yellow-400"
                          : doc.status === "paid" ? "bg-green-500/10 text-green-400"
                          : "bg-zinc-800 text-zinc-400"
                        }`}>{doc.status}</span>
                      </div>
                      <p className="text-xs text-zinc-500">{doc.number} · {new Date(doc.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                      <span className="text-base font-bold text-green-400">
                        £{doc.total.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                      </span>
                      <Link href={`/tool?id=${doc.id}`}
                        className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white transition">
                        View
                      </Link>
                      {doc.type === "quote" && (
                        <button onClick={() => handleConvert(doc)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-green-500 text-zinc-300 hover:text-green-400 transition">
                          → Invoice
                        </button>
                      )}
                      <button onClick={() => handleDelete(doc.id)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-red-500/40 text-zinc-600 hover:text-red-400 transition">
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
