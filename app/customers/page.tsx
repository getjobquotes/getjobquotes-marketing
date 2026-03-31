"use client";
import { useOnboarding } from "@/lib/useOnboarding";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import TopNav from "@/components/TopNav";
import Link from "next/link";

type Customer = {
  id: string; name: string; email: string; phone: string;
  address: string; created_at: string;
};

export default function CustomersPage() {
  const supabase = createClient();
  const auth = useAuthGuard();
  const { markComplete } = useOnboarding(auth.status === "authenticated" ? auth.user.id : null);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });

  useEffect(() => {
    if (auth.status !== "authenticated") return;
    supabase.from("customers")
      .select("*").eq("user_id", auth.user.id)
      .order("name")
      .then(({ data }) => { setCustomers(data || []); setLoading(false); });
  }, [auth.status]);

  const resetForm = () => {
    setForm({ name: "", email: "", phone: "", address: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (c: Customer) => {
    setForm({ name: c.name, email: c.email || "", phone: c.phone || "", address: c.address || "" });
    setEditingId(c.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async () => {
    if (!form.name.trim() || auth.status !== "authenticated") return;
    setSaving(true);
    if (editingId) {
      const { data } = await supabase.from("customers")
        .update({ name: form.name, email: form.email, phone: form.phone, address: form.address })
        .eq("id", editingId).select().single();
      if (data) setCustomers(p => p.map(c => c.id === editingId ? data : c));
    } else {
      const { data } = await supabase.from("customers")
        .insert({ user_id: auth.user.id, ...form }).select().single();
      markComplete("completed_first_customer");
      if (data) setCustomers(p => [...p, data].sort((a, b) => a.name.localeCompare(b.name)));
    }
    setSaving(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this customer?")) return;
    await supabase.from("customers").delete().eq("id", id);
    setCustomers(p => p.filter(c => c.id !== id));
  };

  const filtered = customers.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q);
  });

  if (auth.status === "loading") return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-zinc-600 text-sm animate-pulse">Loading...</p>
    </div>
  );
  if (auth.status === "unauthenticated") return null;

  return (
    <div className="min-h-screen bg-black text-white">
      <TopNav />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Customers</h1>
            <p className="text-zinc-500 text-sm mt-1">Save clients to fill quotes quickly.</p>
          </div>
          <button onClick={() => { resetForm(); setShowForm(v => !v); }}
            className="px-4 py-2 text-sm font-bold bg-green-600 hover:bg-green-500 rounded-xl transition">
            {showForm && !editingId ? "Cancel" : "+ Add Customer"}
          </button>
        </div>

        {/* Add / Edit form */}
        {showForm && (
          <div className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-5 mb-6 space-y-3">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest">
              {editingId ? "Edit Customer" : "New Customer"}
            </h2>
            {[
              { k: "name", label: "Name *", ph: "John Smith", type: "text" },
              { k: "email", label: "Email", ph: "john@email.com", type: "email" },
              { k: "phone", label: "Phone", ph: "07700 900000", type: "tel" },
            ].map(f => (
              <div key={f.k}>
                <label className="text-xs text-zinc-500 mb-1 block">{f.label}</label>
                <input
                  type={f.type}
                  value={(form as any)[f.k]}
                  onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                  placeholder={f.ph}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition"
                />
              </div>
            ))}
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Address</label>
              <textarea
                value={form.address}
                onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                placeholder={"123 Trade Street\nManchester\nM1 1AA"}
                rows={2}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition resize-none"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={handleSave} disabled={saving || !form.name.trim()}
                className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-sm font-bold text-white transition disabled:opacity-50">
                {saving ? "Saving..." : editingId ? "Save Changes" : "Add Customer"}
              </button>
              <button onClick={resetForm}
                className="px-4 py-2.5 rounded-xl border border-zinc-700 text-sm text-zinc-400 hover:text-white transition">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        {customers.length > 0 && (
          <div className="relative mb-4">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search customers..."
              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition" />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-lg leading-none">×</button>}
          </div>
        )}

        {/* Empty state */}
        {!loading && customers.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center">
            <div className="text-5xl mb-4">👥</div>
            <h2 className="text-xl font-bold mb-2">No customers yet</h2>
            <p className="text-zinc-400 text-sm mb-6 max-w-xs mx-auto">
              Save your regular clients here so you can fill quotes in one tap.
            </p>
            <button onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-sm transition">
              Add First Customer →
            </button>
          </div>
        )}

        {/* Customer list */}
        <div className="space-y-2">
          {filtered.map(c => (
            <div key={c.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-4 hover:border-zinc-700 transition">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{c.name}</p>
                  {c.email && <p className="text-xs text-zinc-500 mt-0.5 truncate">{c.email}</p>}
                  {c.phone && <p className="text-xs text-zinc-600 mt-0.5">{c.phone}</p>}
                  {c.address && <p className="text-xs text-zinc-700 mt-0.5 truncate">{c.address.replace(/\n/g, ", ")}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link href={`/tool?customer=${c.id}`}
                    className="text-xs px-3 py-1.5 rounded-lg bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white border border-green-700/30 transition">
                    + Quote
                  </Link>
                  <button onClick={() => handleEdit(c)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white transition">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(c.id)}
                    className="text-xs px-2 py-1.5 text-zinc-700 hover:text-red-400 transition">
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && search && (
            <p className="text-center text-zinc-600 text-sm py-6">No customers match "{search}"</p>
          )}
        </div>

        <div className="mt-10 pt-6 border-t border-zinc-900 flex gap-4 text-xs text-zinc-700">
          <Link href="/dashboard" className="hover:text-zinc-400 transition">← Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
