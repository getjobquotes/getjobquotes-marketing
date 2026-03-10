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
