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
