#!/bin/bash
# Run from ~/projects/getjobquotes-marketing
# bash install-features.sh

echo "🔨 Building all features..."

# ============================================================
# 1. Supabase migration - new tables
# ============================================================
cat > supabase-migration.sql << 'ENDOFFILE'
-- Run this in your Supabase SQL editor

-- Business profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  business_name text,
  business_email text,
  business_phone text,
  business_address text,
  logo_url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profile" ON profiles
  FOR ALL USING (auth.uid() = user_id);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  address text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own customers" ON customers
  FOR ALL USING (auth.uid() = user_id);

-- Add new columns to documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS line_items jsonb DEFAULT '[]';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS signature_data text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS client_signature_data text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS paid_at timestamptz;

-- Storage bucket for logos (run in Supabase dashboard Storage)
-- Create bucket named: logos (public)
ENDOFFILE

echo "✅ supabase-migration.sql created — run this in Supabase SQL editor"

# ============================================================
# 2. Dashboard with all features
# ============================================================
mkdir -p app/dashboard

cat > app/dashboard/page.tsx << 'ENDOFFILE'
"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import TopNav from "@/components/TopNav";

type LineItem = { description: string; quantity: number; unitPrice: number };

type Document = {
  id: string;
  type: "quote" | "invoice";
  number: string;
  client_name: string;
  client_email: string;
  total: number;
  status: string;
  created_at: string;
  description: string;
  labour_cost: number;
  materials_cost: number;
  vat: boolean;
  line_items: LineItem[];
  notes: string;
  paid_at: string | null;
};

function getGreeting(name: string | null) {
  const hour = new Date().getHours();
  const first = name?.split(" ")[0] || null;
  const suffix = first ? `, ${first}` : "";
  if (hour < 12) return `Good morning${suffix} ☀️`;
  if (hour < 17) return `Good afternoon${suffix} 👋`;
  return `Good evening${suffix} 🌙`;
}

function formatMoney(n: number) {
  if (n >= 1000000) return `£${(n / 1000000).toFixed(1)}m`;
  if (n >= 10000) return `£${(n / 1000).toFixed(1)}k`;
  return `£${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      setUser(user);

      const metaName = user.user_metadata?.full_name || user.user_metadata?.name;
      const emailName = user.email?.split("@")[0]?.replace(/[._]/g, " ")?.replace(/\b\w/g, (c: string) => c.toUpperCase());
      const name = metaName || emailName || null;
      setDisplayName(name);
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

  const handleMarkPaid = async (doc: Document) => {
    setMarkingPaid(doc.id);
    await supabase.from("documents").update({
      status: "paid",
      paid_at: new Date().toISOString(),
    }).eq("id", doc.id);
    setDocs((prev) => prev.map((d) => d.id === doc.id ? { ...d, status: "paid", paid_at: new Date().toISOString() } : d));
    setMarkingPaid(null);
  };

  const handleConvert = async (doc: Document) => {
    const invoiceNumber = "INV-" + Date.now().toString().slice(-6);
    await supabase.from("documents").insert({
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
      line_items: doc.line_items || [],
      notes: doc.notes || "",
      linked_quote_id: doc.id,
    });
    const { data } = await supabase.from("documents").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setDocs(data || []);
    setActiveTab("invoices");
  };

  const quotes = docs.filter((d) => d.type === "quote");
  const invoices = docs.filter((d) => d.type === "invoice");
  const totalInvoiced = invoices.reduce((sum, d) => sum + d.total, 0);
  const displayed = activeTab === "quotes" ? quotes : invoices;

  return (
    <div className="min-h-screen bg-black text-white">
      <TopNav />
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Greeting */}
        <div className="mb-8">
          {isFirstVisit ? (
            <>
              <h1 className="text-3xl font-bold mb-1">👋 Welcome{displayName ? `, ${displayName.split(" ")[0]}` : ""}!</h1>
              <p className="text-zinc-400 text-sm">Your account is ready. Create your first quote in under 2 minutes.</p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-1">{getGreeting(displayName)}</h1>
              <p className="text-zinc-400 text-sm">Here's your quote and invoice overview.</p>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Quotes", value: quotes.length },
            { label: "Invoices", value: invoices.length },
            { label: "Total Invoiced", value: formatMoney(totalInvoiced) },
            { label: "Pending", value: invoices.filter((d) => d.status === "pending").length, sub: "invoices" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-white truncate">{loading ? "—" : s.value}</p>
              {s.sub && <p className="text-xs text-zinc-600 mt-0.5">{s.sub}</p>}
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="flex gap-3 mb-8">
          <Link href="/profile" className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-300 hover:text-white hover:border-zinc-600 transition">
            🏢 Business Profile
          </Link>
          <Link href="/customers" className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-300 hover:text-white hover:border-zinc-600 transition">
            👥 Customers
          </Link>
        </div>

        {/* Empty state */}
        {!loading && docs.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-14 text-center mb-10">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-xl font-semibold mb-2">No quotes yet</h2>
            <p className="text-zinc-400 text-sm mb-6 max-w-xs mx-auto">Create your first quote and download a professional PDF in minutes.</p>
            <Link href="/tool" className="inline-block px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-semibold text-sm transition">
              Create First Quote
            </Link>
          </div>
        )}

        {/* Tabs + list */}
        {docs.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-5">
              <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-full">
                {(["quotes", "invoices"] as const).map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-5 py-1.5 rounded-full text-sm font-semibold capitalize transition ${activeTab === tab ? "bg-green-600 text-white" : "text-zinc-400 hover:text-white"}`}>
                    {tab} ({tab === "quotes" ? quotes.length : invoices.length})
                  </button>
                ))}
              </div>
              <Link href="/tool" className="px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-500 rounded-lg transition">
                + New Quote
              </Link>
            </div>

            <div className="space-y-2">
              {displayed.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-800 p-10 text-center">
                  <p className="text-zinc-500 text-sm">{activeTab === "invoices" ? "No invoices yet — convert a quote to create one." : "No quotes yet."}</p>
                </div>
              ) : (
                displayed.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 px-5 py-4 hover:border-zinc-700 transition">
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
                      <span className="text-base font-bold text-green-400">{formatMoney(doc.total)}</span>
                      <Link href={`/tool?id=${doc.id}`} className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white transition">View</Link>
                      {doc.type === "quote" && (
                        <button onClick={() => handleConvert(doc)} className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-green-500 text-zinc-300 hover:text-green-400 transition">→ Invoice</button>
                      )}
                      {doc.type === "invoice" && doc.status !== "paid" && (
                        <button onClick={() => handleMarkPaid(doc)} disabled={markingPaid === doc.id}
                          className="text-xs px-3 py-1.5 rounded-lg border border-green-700 hover:bg-green-600 text-green-400 hover:text-white transition disabled:opacity-50">
                          {markingPaid === doc.id ? "..." : "✓ Paid"}
                        </button>
                      )}
                      <button onClick={() => handleDelete(doc.id)} className="text-xs px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-red-500/40 text-zinc-600 hover:text-red-400 transition">Delete</button>
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
ENDOFFILE
echo "✅ app/dashboard/page.tsx"

# ============================================================
# 3. Business Profile page
# ============================================================
mkdir -p app/profile

cat > app/profile/page.tsx << 'ENDOFFILE'
"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import TopNav from "@/components/TopNav";

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    business_name: "",
    business_email: "",
    business_phone: "",
    business_address: "",
    logo_url: "",
  });

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      setUser(user);
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      if (data) setForm({ business_name: data.business_name || "", business_email: data.business_email || "", business_phone: data.business_phone || "", business_address: data.business_address || "", logo_url: data.logo_url || "" });
    };
    init();
  }, []);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/logo.${ext}`;
    const { error } = await supabase.storage.from("logos").upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("logos").getPublicUrl(path);
      set("logo_url", data.publicUrl);
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await supabase.from("profiles").upsert({ user_id: user.id, ...form }, { onConflict: "user_id" });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <TopNav />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Business Profile</h1>
          <p className="text-zinc-400 text-sm">This information appears on your quotes and invoices.</p>
        </div>

        <div className="space-y-5">

          {/* Logo */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest mb-4">Logo</h2>
            <div className="flex items-center gap-4">
              {form.logo_url ? (
                <img src={form.logo_url} alt="Logo" className="w-20 h-20 object-contain rounded-xl border border-zinc-700 bg-white p-2" />
              ) : (
                <div className="w-20 h-20 rounded-xl border border-dashed border-zinc-700 flex items-center justify-center text-zinc-600 text-xs text-center">No logo</div>
              )}
              <div>
                <button onClick={() => fileRef.current?.click()}
                  className="px-4 py-2 rounded-xl border border-zinc-700 text-sm text-zinc-300 hover:text-white hover:border-zinc-500 transition">
                  {uploading ? "Uploading..." : "Upload Logo"}
                </button>
                <p className="text-xs text-zinc-600 mt-1">PNG or JPG, max 2MB</p>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </div>
            </div>
          </div>

          {/* Business details */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest">Business Details</h2>
            {[
              { key: "business_name", label: "Business Name", placeholder: "e.g. Smith Plumbing Ltd" },
              { key: "business_email", label: "Business Email", placeholder: "hello@yourbusiness.co.uk" },
              { key: "business_phone", label: "Phone Number", placeholder: "07700 900000" },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-xs text-zinc-500 mb-1 block">{f.label}</label>
                <input value={(form as any)[f.key]} onChange={(e) => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition" />
              </div>
            ))}
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Business Address</label>
              <textarea value={form.business_address} onChange={(e) => set("business_address", e.target.value)}
                placeholder={"123 Trade Street\nManchester\nM1 1AA"}
                rows={3}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition resize-none" />
            </div>
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full py-3.5 rounded-xl bg-green-600 hover:bg-green-500 text-sm font-bold text-white transition disabled:opacity-50">
            {saved ? "✓ Saved!" : saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
ENDOFFILE
echo "✅ app/profile/page.tsx"

# ============================================================
# 4. Customers page
# ============================================================
mkdir -p app/customers

cat > app/customers/page.tsx << 'ENDOFFILE'
"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TopNav from "@/components/TopNav";

type Customer = { id: string; name: string; email: string; phone: string; address: string };

export default function CustomersPage() {
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      setUser(user);
      const { data } = await supabase.from("customers").select("*").eq("user_id", user.id).order("name");
      setCustomers(data || []);
      setLoading(false);
    };
    init();
  }, []);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    const { data } = await supabase.from("customers").insert({ user_id: user.id, ...form }).select().single();
    if (data) setCustomers((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    setForm({ name: "", email: "", phone: "", address: "" });
    setShowForm(false);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this customer?")) return;
    await supabase.from("customers").delete().eq("id", id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <TopNav />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Customers</h1>
            <p className="text-zinc-400 text-sm">Save client details for quick use on quotes.</p>
          </div>
          <button onClick={() => setShowForm((v) => !v)}
            className="px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-500 rounded-lg transition">
            + Add Customer
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 mb-6 space-y-3">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest mb-2">New Customer</h2>
            {[
              { k: "name", label: "Name *", placeholder: "John Smith" },
              { k: "email", label: "Email", placeholder: "john@email.com" },
              { k: "phone", label: "Phone", placeholder: "07700 900000" },
            ].map((f) => (
              <div key={f.k}>
                <label className="text-xs text-zinc-500 mb-1 block">{f.label}</label>
                <input value={(form as any)[f.k]} onChange={(e) => set(f.k, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition" />
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving || !form.name}
                className="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-sm font-semibold text-white transition disabled:opacity-50">
                {saving ? "Saving..." : "Save Customer"}
              </button>
              <button onClick={() => setShowForm(false)} className="px-5 py-2 rounded-xl border border-zinc-700 text-sm text-zinc-400 hover:text-white transition">Cancel</button>
            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="text-zinc-500 text-sm text-center py-10">Loading...</div>
        ) : customers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-zinc-400 text-sm">No customers yet. Add one to get started.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {customers.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 px-5 py-4 hover:border-zinc-700 transition">
                <div>
                  <p className="text-sm font-semibold text-white">{c.name}</p>
                  <p className="text-xs text-zinc-500">{[c.email, c.phone].filter(Boolean).join(" · ") || "No contact info"}</p>
                </div>
                <button onClick={() => handleDelete(c.id)} className="text-xs px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-red-500/40 text-zinc-600 hover:text-red-400 transition">Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
ENDOFFILE
echo "✅ app/customers/page.tsx"

# ============================================================
# 5. Tool page with line items + signature
# ============================================================
mkdir -p app/tool

cat > app/tool/page.tsx << 'ENDOFFILE'
"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense } from "react";
import TopNav from "@/components/TopNav";
import jsPDF from "jspdf";

type Template = "minimal" | "modern" | "formal" | "branded";
type LineItem = { description: string; quantity: number; unitPrice: number };

function QuoteForm() {
  const supabase = createClient();
  const router = useRouter();
  const params = useSearchParams();
  const editId = params.get("id");
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [template, setTemplate] = useState<Template>("modern");
  const [showSig, setShowSig] = useState(false);
  const [sigData, setSigData] = useState<string>("");

  const [form, setForm] = useState({
    clientName: "",
    clientEmail: "",
    description: "",
    vat: false,
    notes: "",
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      setUser(user);

      const [{ data: prof }, { data: custs }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("customers").select("*").eq("user_id", user.id).order("name"),
      ]);
      if (prof) setProfile(prof);
      setCustomers(custs || []);

      if (editId) {
        const { data } = await supabase.from("documents").select("*").eq("id", editId).single();
        if (data) {
          setForm({ clientName: data.client_name, clientEmail: data.client_email || "", description: data.description || "", vat: data.vat, notes: data.notes || "" });
          if (data.line_items?.length) setLineItems(data.line_items);
          if (data.signature_data) setSigData(data.signature_data);
        }
      }
    };
    init();
  }, []);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const updateItem = (i: number, k: keyof LineItem, v: any) => {
    setLineItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [k]: v } : item));
  };
  const addItem = () => setLineItems((prev) => [...prev, { description: "", quantity: 1, unitPrice: 0 }]);
  const removeItem = (i: number) => setLineItems((prev) => prev.filter((_, idx) => idx !== i));

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const vatAmount = form.vat ? subtotal * 0.2 : 0;
  const total = subtotal + vatAmount;

  // Signature canvas
  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    const canvas = sigCanvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.moveTo(x, y);
  };
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = sigCanvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
  };
  const endDraw = () => {
    isDrawing.current = false;
    setSigData(sigCanvasRef.current!.toDataURL());
  };
  const clearSig = () => {
    const canvas = sigCanvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSigData("");
  };

  const handleSave = async () => {
    if (!form.clientName) { alert("Please enter a client name."); return; }
    setSaving(true);
    const number = editId ? undefined : "QUO-" + Date.now().toString().slice(-6);
    const payload: any = {
      user_id: user.id, type: "quote", client_name: form.clientName,
      client_email: form.clientEmail, description: form.description,
      labour_cost: 0, materials_cost: subtotal, vat: form.vat, total,
      status: "pending", line_items: lineItems, notes: form.notes,
      signature_data: sigData || null,
    };
    if (number) payload.number = number;
    if (editId) await supabase.from("documents").update(payload).eq("id", editId);
    else await supabase.from("documents").insert(payload);
    setSaving(false);
    setSaved(true);
    setTimeout(() => router.push("/dashboard"), 1500);
  };

  const handleDownload = async () => {
    const doc = new jsPDF();
    const quoteNum = editId || "QUO-" + Date.now().toString().slice(-6);
    const date = new Date().toLocaleDateString("en-GB");

    // Header based on template
    if (template === "modern") {
      doc.setFillColor(18, 18, 18);
      doc.rect(0, 0, 210, 38, "F");
      if (profile?.logo_url) {
        try {
          doc.addImage(profile.logo_url, "PNG", 14, 8, 22, 22);
        } catch {}
      }
      doc.setTextColor(34, 197, 94);
      doc.setFontSize(20); doc.setFont("helvetica", "bold");
      doc.text("QUOTE", profile?.logo_url ? 42 : 14, 18);
      doc.setTextColor(200, 200, 200); doc.setFontSize(9); doc.setFont("helvetica", "normal");
      doc.text(`Ref: ${quoteNum}`, profile?.logo_url ? 42 : 14, 26);
      doc.text(date, profile?.logo_url ? 42 : 14, 33);
      if (profile?.business_name) { doc.text(profile.business_name, 196, 15, { align: "right" }); }
      if (profile?.business_phone) { doc.text(profile.business_phone, 196, 22, { align: "right" }); }
    } else if (template === "branded") {
      doc.setFillColor(22, 163, 74);
      doc.rect(0, 0, 210, 35, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20); doc.setFont("helvetica", "bold");
      doc.text(profile?.business_name || "GetJobQuotes", 14, 16);
      doc.setFontSize(9); doc.setFont("helvetica", "normal");
      doc.text(`QUOTE · ${quoteNum} · ${date}`, 14, 27);
    } else {
      doc.setFontSize(20); doc.setFont("helvetica", "bold");
      doc.text("Quote", 14, 20);
      doc.setFontSize(9); doc.setFont("helvetica", "normal");
      doc.text(quoteNum, 196, 14, { align: "right" });
      doc.text(date, 196, 21, { align: "right" });
      if (profile?.business_name) doc.text(profile.business_name, 196, 28, { align: "right" });
    }

    const yStart = template === "modern" || template === "branded" ? 48 : 38;

    // Client
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10); doc.setFont("helvetica", "bold");
    doc.text("Bill To", 14, yStart);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    doc.text(form.clientName, 14, yStart + 7);
    if (form.clientEmail) doc.text(form.clientEmail, 14, yStart + 14);

    // Line items table
    const tableY = yStart + 26;
    doc.setFillColor(245, 245, 245);
    doc.rect(14, tableY, 182, 8, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(9);
    doc.text("Description", 16, tableY + 5.5);
    doc.text("Qty", 140, tableY + 5.5, { align: "right" });
    doc.text("Unit Price", 165, tableY + 5.5, { align: "right" });
    doc.text("Total", 194, tableY + 5.5, { align: "right" });

    let rowY = tableY + 14;
    doc.setFont("helvetica", "normal");
    lineItems.forEach((item, i) => {
      if (i % 2 === 1) { doc.setFillColor(250, 250, 250); doc.rect(14, rowY - 5, 182, 9, "F"); }
      doc.text(item.description || "-", 16, rowY);
      doc.text(String(item.quantity), 140, rowY, { align: "right" });
      doc.text(`£${item.unitPrice.toFixed(2)}`, 165, rowY, { align: "right" });
      doc.text(`£${(item.quantity * item.unitPrice).toFixed(2)}`, 194, rowY, { align: "right" });
      rowY += 9;
    });

    // Totals
    rowY += 4;
    doc.setFont("helvetica", "normal");
    doc.text("Subtotal", 150, rowY); doc.text(`£${subtotal.toFixed(2)}`, 194, rowY, { align: "right" }); rowY += 8;
    if (form.vat) { doc.text("VAT (20%)", 150, rowY); doc.text(`£${vatAmount.toFixed(2)}`, 194, rowY, { align: "right" }); rowY += 8; }
    doc.setFillColor(22, 163, 74);
    doc.rect(14, rowY, 182, 10, "F");
    doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold");
    doc.text("TOTAL", 16, rowY + 7);
    doc.text(`£${total.toFixed(2)}`, 194, rowY + 7, { align: "right" });
    rowY += 18;

    // Notes
    if (form.notes) {
      doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "bold"); doc.setFontSize(9);
      doc.text("Notes", 14, rowY);
      doc.setFont("helvetica", "normal");
      const noteLines = doc.splitTextToSize(form.notes, 182);
      doc.text(noteLines, 14, rowY + 7);
      rowY += 7 + noteLines.length * 6;
    }

    // Signature
    if (sigData) {
      rowY += 6;
      doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "bold"); doc.setFontSize(9);
      doc.text("Signature", 14, rowY);
      try { doc.addImage(sigData, "PNG", 14, rowY + 3, 60, 20); } catch {}
      rowY += 28;
    }

    doc.save(`quote-${form.clientName.replace(/\s+/g, "-").toLowerCase()}.pdf`);
  };

  if (saved) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-white mb-2">Quote saved!</h2>
        <p className="text-zinc-400 text-sm">Taking you to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">{editId ? "Edit Quote" : "New Quote"}</h1>
        <p className="text-zinc-400 text-sm">Fill in the details to generate a professional PDF.</p>
      </div>

      <div className="space-y-5">

        {/* Client */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest">Client Details</h2>
          {customers.length > 0 && (
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Select Saved Customer</label>
              <select onChange={(e) => {
                const c = customers.find((c) => c.id === e.target.value);
                if (c) set("clientName", c.name) || set("clientEmail", c.email || "");
              }} className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white text-sm outline-none focus:border-green-500 transition">
                <option value="">— Pick a customer —</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Client Name *</label>
            <input value={form.clientName} onChange={(e) => set("clientName", e.target.value)} placeholder="John Smith"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition" />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Client Email</label>
            <input value={form.clientEmail} onChange={(e) => set("clientEmail", e.target.value)} placeholder="client@email.com" type="email"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition" />
          </div>
        </div>

        {/* Line items */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest">Line Items</h2>
          <div className="grid grid-cols-12 gap-2 text-xs text-zinc-500 px-1">
            <span className="col-span-6">Description</span>
            <span className="col-span-2 text-right">Qty</span>
            <span className="col-span-3 text-right">Unit Price</span>
            <span className="col-span-1" />
          </div>
          {lineItems.map((item, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <input value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)}
                placeholder="e.g. Labour" className="col-span-6 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition" />
              <input value={item.quantity} onChange={(e) => updateItem(i, "quantity", parseFloat(e.target.value) || 0)}
                type="number" min="0" className="col-span-2 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white text-sm outline-none focus:border-green-500 transition text-right" />
              <input value={item.unitPrice} onChange={(e) => updateItem(i, "unitPrice", parseFloat(e.target.value) || 0)}
                type="number" min="0" step="0.01" className="col-span-3 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white text-sm outline-none focus:border-green-500 transition text-right" />
              <button onClick={() => removeItem(i)} className="col-span-1 text-zinc-600 hover:text-red-400 text-lg text-center transition">×</button>
            </div>
          ))}
          <button onClick={addItem} className="text-sm text-green-400 hover:text-green-300 transition">+ Add Line Item</button>
          <label className="flex items-center gap-3 cursor-pointer pt-2">
            <div onClick={() => set("vat", !form.vat)} className={`w-11 h-6 rounded-full transition-colors ${form.vat ? "bg-green-600" : "bg-zinc-700"} relative`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.vat ? "left-6" : "left-1"}`} />
            </div>
            <span className="text-sm text-zinc-300">Add VAT (20%)</span>
          </label>
        </div>

        {/* Total */}
        <div className="rounded-2xl border border-green-600/30 bg-green-600/5 p-6">
          {lineItems.map((item, i) => item.description && (
            <div key={i} className="flex justify-between text-sm text-zinc-400 mb-1">
              <span>{item.description} ({item.quantity}×)</span>
              <span>£{(item.quantity * item.unitPrice).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm text-zinc-400 mb-1 pt-2 border-t border-zinc-800">
            <span>Subtotal</span><span>£{subtotal.toFixed(2)}</span>
          </div>
          {form.vat && <div className="flex justify-between text-sm text-zinc-400 mb-1"><span>VAT (20%)</span><span>£{vatAmount.toFixed(2)}</span></div>}
          <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-zinc-800">
            <span>Total</span><span className="text-green-400">£{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest mb-3">Notes</h2>
          <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)}
            placeholder="Payment terms, validity period, any other notes..."
            rows={3} className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition resize-none" />
        </div>

        {/* Signature */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest">Your Signature</h2>
            <button onClick={() => setShowSig((v) => !v)} className="text-xs text-green-400 hover:text-green-300 transition">
              {showSig ? "Hide" : sigData ? "Edit" : "Add Signature"}
            </button>
          </div>
          {sigData && !showSig && (
            <img src={sigData} alt="Signature" className="h-12 bg-zinc-900 rounded-lg p-1" />
          )}
          {showSig && (
            <div>
              <canvas ref={sigCanvasRef} width={500} height={120}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 cursor-crosshair touch-none"
                onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
                onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw} />
              <div className="flex gap-3 mt-2">
                <button onClick={clearSig} className="text-xs text-zinc-500 hover:text-white transition">Clear</button>
                <button onClick={() => setShowSig(false)} className="text-xs text-green-400 hover:text-green-300 transition">Done</button>
              </div>
            </div>
          )}
          {!sigData && !showSig && <p className="text-xs text-zinc-600">No signature added. Click "Add Signature" to sign.</p>}
        </div>

        {/* Template */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest mb-4">PDF Template</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(["minimal", "modern", "formal", "branded"] as Template[]).map((t) => (
              <button key={t} onClick={() => setTemplate(t)}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold capitalize border transition ${template === t ? "bg-green-600 border-green-600 text-white" : "border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-3.5 rounded-xl bg-green-600 hover:bg-green-500 text-sm font-bold text-white transition disabled:opacity-50">
            {saving ? "Saving..." : editId ? "Update Quote" : "Save Quote"}
          </button>
          <button onClick={handleDownload}
            className="flex-1 py-3.5 rounded-xl border border-zinc-700 hover:border-zinc-500 text-sm font-semibold text-zinc-300 hover:text-white transition">
            Download PDF
          </button>
        </div>

      </div>
    </div>
  );
}

export default function ToolPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <TopNav />
      <Suspense fallback={<div className="text-zinc-500 text-center py-20 text-sm">Loading...</div>}>
        <QuoteForm />
      </Suspense>
    </div>
  );
}
ENDOFFILE
echo "✅ app/tool/page.tsx"

# ============================================================
# 6. Update middleware to include new routes
# ============================================================
cat > middleware.ts << 'ENDOFFILE'
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  const protectedRoutes = ["/dashboard", "/tool", "/profile", "/customers"];

  if (protectedRoutes.some((r) => pathname.startsWith(r)) && !user) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }
  if (pathname.startsWith("/auth") && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|ads.txt|api).*)"],
};
ENDOFFILE
echo "✅ middleware.ts"

# ============================================================
# 7. Commit and push
# ============================================================
git add .
git commit -m "feat: line items, signatures, business profile, customers, mark as paid, total fix"
git push origin main

echo ""
echo "🚀 Done! Vercel deploys in ~60 seconds."
echo ""
echo "⚠️  IMPORTANT: Run supabase-migration.sql in your Supabase SQL editor"
echo "   AND create a 'logos' storage bucket (public) in Supabase Storage"
