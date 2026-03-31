"use client";
import { useOnboarding } from "@/lib/useOnboarding";
import { useAuthGuard } from "@/lib/useAuthGuard";

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
  const [saveMsg, setSaveMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [form, setForm] = useState({
    business_name: "",
    business_email: "",
    business_phone: "",
    business_address: "",
    logo_url: "",
  });

  useEffect(() => {
    const init = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      setUser(user);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows found (first time), that's fine
        console.error("Profile load error:", error);
      }

      if (data) {
        setForm({
          business_name: data.business_name || "",
          business_email: data.business_email || "",
          business_phone: data.business_phone || "",
          business_address: data.business_address || "",
          logo_url: data.logo_url || "",
        });
      }
    };
    init();
  }, []);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    setUploadMsg("");

    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${user.id}/logo.${ext}`;

    // Try upload
    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      setUploadMsg(`Upload failed: ${uploadError.message}. Make sure the 'logos' bucket exists and is public in Supabase Storage.`);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("logos").getPublicUrl(path);
    const logoUrl = urlData.publicUrl + `?t=${Date.now()}`; // cache bust

    set("logo_url", logoUrl);
    setUploadMsg("✓ Logo uploaded!");
    setUploading(false);

    // Auto-save logo url to profile immediately
    if (user) {
      await supabase.from("profiles").upsert(
        { user_id: user.id, logo_url: logoUrl },
        { onConflict: "user_id" }
      );
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaveMsg("");

    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          user_id: user.id,
          business_name: form.business_name,
          business_email: form.business_email,
          business_phone: form.business_phone,
          business_address: form.business_address,
          logo_url: form.logo_url,
        },
        { onConflict: "user_id" }
      );

    setSaving(false);

    if (error) {
      console.error("Save error:", error);
      setSaveMsg(`Error saving: ${error.message}`);
    } else {
      setSaveMsg("✓ Profile saved!");
      setTimeout(() => setSaveMsg(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <TopNav />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Business Profile</h1>
          <p className="text-zinc-400 text-sm">
            This information appears on your quotes and invoices.
          </p>
        </div>

        <div className="space-y-5">

          {/* Logo */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest mb-4">
              Logo
            </h2>
            <div className="flex items-center gap-5">
              {form.logo_url ? (
                <img
                  src={form.logo_url}
                  alt="Logo"
                  className="w-20 h-20 object-contain rounded-xl border border-zinc-700 bg-white p-2"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl border border-dashed border-zinc-700 flex items-center justify-center text-zinc-600 text-xs text-center leading-tight p-2">
                  No logo yet
                </div>
              )}
              <div>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 rounded-xl border border-zinc-700 text-sm text-zinc-300 hover:text-white hover:border-zinc-500 transition disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : form.logo_url ? "Change Logo" : "Upload Logo"}
                </button>
                <p className="text-xs text-zinc-600 mt-1.5">PNG or JPG, max 2MB</p>
                {uploadMsg && (
                  <p className={`text-xs mt-1 ${uploadMsg.startsWith("✓") ? "text-green-400" : "text-red-400"}`}>
                    {uploadMsg}
                  </p>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </div>
            </div>
          </div>

          {/* Business details */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest">
              Business Details
            </h2>
            {[
              { key: "business_name", label: "Business Name", placeholder: "e.g. Smith Plumbing Ltd" },
              { key: "business_email", label: "Business Email", placeholder: "hello@yourbusiness.co.uk" },
              { key: "business_phone", label: "Phone Number", placeholder: "07700 900000" },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-xs text-zinc-500 mb-1 block">{f.label}</label>
                <input
                  value={(form as any)[f.key]}
                  onChange={(e) => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition"
                />
              </div>
            ))}
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Business Address</label>
              <textarea
                value={form.business_address}
                onChange={(e) => set("business_address", e.target.value)}
                placeholder={"123 Trade Street\nManchester\nM1 1AA"}
                rows={3}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition resize-none"
              />
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 rounded-xl bg-green-600 hover:bg-green-500 text-sm font-bold text-white transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>

          {saveMsg && (
            <p className={`text-center text-sm ${saveMsg.startsWith("✓") ? "text-green-400" : "text-red-400"}`}>
              {saveMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
