"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TopNav from "@/components/TopNav";
import AdBanner from "@/components/AdBanner";

type Customer = { id: string; name: string; email: string; phone: string; address: string; created_at: string };
type SortKey = "date_new" | "date_old" | "name_asc" | "name_desc";

export default function CustomersPage() {
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("date_new");
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      setUser(user);
      const { data } = await supabase.from("customers").select("*").eq("user_id", user.id);
      setCustomers(data || []);
      setLoading(false);
    };
    init();
  }, []);

  const resetForm = () => { setForm({ name: "", email: "", phone: "", address: "" }); setEditId(null); };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    if (editId) {
      const { data } = await supabase.from("customers").update({ ...form }).eq("id", editId).select().single();
      if (data) setCustomers((prev) => prev.map((c) => c.id === editId ? data : c));
    } else {
      const { data } = await supabase.from("customers").insert({ user_id: user.id, ...form }).select().single();
      if (data) setCustomers((prev) => [data, ...prev]);
    }
    resetForm(); setShowForm(false); setSaving(false);
  };

  const handleEdit = (c: Customer) => {
    setForm({ name: c.name, email: c.email || "", phone: c.phone || "", address: c.address || "" });
    setEditId(c.id); setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this customer?")) return;
    await supabase.from("customers").delete().eq("id", id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  const filtered = customers
    .filter((c) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.phone?.includes(q) || c.address?.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sort === "name_asc") return a.name.localeCompare(b.name);
      if (sort === "name_desc") return b.name.localeCompare(a.name);
      if (sort === "date_old") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="min-h-screen bg-black text-white">
      <TopNav />
      <AdBanner className="border-b border-zinc-900" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Customers</h1>
            <p className="text-zinc-500 text-sm mt-0.5">{customers.length} saved</p>
          </div>
          <button onClick={() => { resetForm(); setShowForm((v) => !v); }}
            className="px-4 py-2 text-sm font-bold bg-green-600 hover:bg-green-500 rounded-xl transition shrink-0">
            {showForm && !editId ? "Cancel" : "+ Add"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 mb-5 space-y-3">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">{editId ? "Edit Customer" : "New Customer"}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { k: "name", label: "Name *", placeholder: "John Smith" },
                { k: "email", label: "Email", placeholder: "john@email.com" },
                { k: "phone", label: "Phone", placeholder: "07700 900000" },
                { k: "address", label: "Address", placeholder: "123 High St, London", span: true },
              ].map((f) => (
                <div key={f.k} className={f.span ? "sm:col-span-2" : ""}>
                  <label className="text-xs text-zinc-500 mb-1 block">{f.label}</label>
                  <input value={(form as any)[f.k]} onChange={(e) => setForm((p) => ({ ...p, [f.k]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={handleSave} disabled={saving || !form.name.trim()}
                className="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-sm font-bold text-white transition disabled:opacity-40">
                {saving ? "Saving..." : editId ? "Update" : "Save Customer"}
              </button>
              <button onClick={() => { resetForm(); setShowForm(false); }}
                className="px-5 py-2.5 rounded-xl border border-zinc-700 text-sm text-zinc-400 hover:text-white transition">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search + Sort */}
        {customers.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">🔍</span>
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email or phone..."
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition" />
              {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-lg leading-none">×</button>}
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}
              className="px-3 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-white text-sm outline-none focus:border-green-500 transition">
              <option value="date_new">Newest first</option>
              <option value="date_old">Oldest first</option>
              <option value="name_asc">Name A → Z</option>
              <option value="name_desc">Name Z → A</option>
            </select>
          </div>
        )}

        {search && <p className="text-xs text-zinc-600 mb-3">{filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{search}"</p>}

        {/* List */}
        {loading ? (
          <div className="text-center py-16 text-zinc-600 text-sm">Loading...</div>
        ) : customers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-zinc-400 text-sm">No customers yet.</p>
            <p className="text-zinc-600 text-xs mt-1">Add one and pick them from the quote form.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-10 text-center">
            <p className="text-zinc-500 text-sm">No customers match "{search}"</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-3.5 hover:border-zinc-700 transition group">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{c.name}</p>
                  <p className="text-xs text-zinc-500 truncate">{[c.email, c.phone].filter(Boolean).join(" · ") || "No contact info"}</p>
                  {c.address && <p className="text-xs text-zinc-700 truncate">{c.address}</p>}
                </div>
                <div className="flex gap-2 shrink-0 opacity-60 group-hover:opacity-100 transition">
                  <button onClick={() => handleEdit(c)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white transition">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(c.id)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-transparent hover:border-red-500/30 text-zinc-700 hover:text-red-400 transition">
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
