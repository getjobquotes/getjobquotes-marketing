#!/bin/bash
# Run from ~/projects/getjobquotes-marketing
# bash fix-profile-logo-sig.sh

echo "🔧 Fixing profile, logo upload and signature..."

# ============================================================
# 1. Fixed profile page
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
ENDOFFILE
echo "✅ app/profile/page.tsx fixed"

# ============================================================
# 2. Fixed tool page - signature + save fixes
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
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saved, setSaved] = useState(false);
  const [template, setTemplate] = useState<Template>("modern");
  const [showSig, setShowSig] = useState(false);
  const [sigData, setSigData] = useState<string>("");
  const [hasSig, setHasSig] = useState(false);

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

      const [profResult, custsResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("customers").select("*").eq("user_id", user.id).order("name"),
      ]);

      if (profResult.data) setProfile(profResult.data);
      setCustomers(custsResult.data || []);

      if (editId) {
        const { data } = await supabase.from("documents").select("*").eq("id", editId).single();
        if (data) {
          setForm({
            clientName: data.client_name || "",
            clientEmail: data.client_email || "",
            description: data.description || "",
            vat: data.vat || false,
            notes: data.notes || "",
          });
          if (data.line_items?.length) setLineItems(data.line_items);
          if (data.signature_data) {
            setSigData(data.signature_data);
            setHasSig(true);
          }
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
  const removeItem = (i: number) => {
    if (lineItems.length === 1) return;
    setLineItems((prev) => prev.filter((_, idx) => idx !== i));
  };

  const subtotal = lineItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
  const vatAmount = form.vat ? subtotal * 0.2 : 0;
  const total = subtotal + vatAmount;

  // Signature helpers
  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    isDrawing.current = true;
    lastPos.current = getPos(e, canvas);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing.current || !sigCanvasRef.current || !lastPos.current) return;
    const canvas = sigCanvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
    setHasSig(true);
  };

  const endDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    isDrawing.current = false;
    lastPos.current = null;
    if (sigCanvasRef.current && hasSig) {
      setSigData(sigCanvasRef.current.toDataURL("image/png"));
    }
  };

  const clearSig = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSigData("");
    setHasSig(false);
  };

  const handleSave = async () => {
    if (!form.clientName.trim()) {
      setSaveMsg("Please enter a client name.");
      return;
    }
    setSaving(true);
    setSaveMsg("");

    // Capture final sig if canvas is open
    let finalSig = sigData;
    if (showSig && sigCanvasRef.current && hasSig) {
      finalSig = sigCanvasRef.current.toDataURL("image/png");
    }

    const validItems = lineItems.filter((item) => item.description.trim());

    const payload: any = {
      user_id: user.id,
      type: "quote",
      client_name: form.clientName.trim(),
      client_email: form.clientEmail.trim(),
      description: form.description.trim() || validItems.map((i) => i.description).join(", "),
      labour_cost: 0,
      materials_cost: subtotal,
      vat: form.vat,
      total,
      status: "pending",
      line_items: lineItems,
      notes: form.notes.trim(),
      signature_data: finalSig || null,
    };

    if (!editId) {
      payload.number = "QUO-" + Date.now().toString().slice(-6);
    }

    const { error } = editId
      ? await supabase.from("documents").update(payload).eq("id", editId)
      : await supabase.from("documents").insert(payload);

    setSaving(false);

    if (error) {
      console.error("Save error:", error);
      setSaveMsg(`Error: ${error.message}`);
    } else {
      setSaved(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    }
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    const quoteNum = editId || ("QUO-" + Date.now().toString().slice(-6));
    const date = new Date().toLocaleDateString("en-GB");

    // Header
    if (template === "modern") {
      doc.setFillColor(18, 18, 18);
      doc.rect(0, 0, 210, 38, "F");
      doc.setTextColor(34, 197, 94);
      doc.setFontSize(20); doc.setFont("helvetica", "bold");
      doc.text("QUOTE", 14, 18);
      doc.setTextColor(200, 200, 200); doc.setFontSize(9); doc.setFont("helvetica", "normal");
      doc.text(`Ref: ${quoteNum}`, 14, 27);
      doc.text(date, 14, 34);
      if (profile?.business_name) {
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text(profile.business_name, 196, 15, { align: "right" });
        doc.setFont("helvetica", "normal");
        if (profile.business_phone) doc.text(profile.business_phone, 196, 23, { align: "right" });
        if (profile.business_email) doc.text(profile.business_email, 196, 30, { align: "right" });
      }
    } else if (template === "branded") {
      doc.setFillColor(22, 163, 74);
      doc.rect(0, 0, 210, 35, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18); doc.setFont("helvetica", "bold");
      doc.text(profile?.business_name || "GetJobQuotes", 14, 16);
      doc.setFontSize(9); doc.setFont("helvetica", "normal");
      doc.text(`QUOTE  ·  ${quoteNum}  ·  ${date}`, 14, 27);
    } else if (template === "formal") {
      doc.setFontSize(18); doc.setFont("helvetica", "bold");
      doc.text("QUOTE", 105, 18, { align: "center" });
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 22, 196, 22);
      doc.setFontSize(9); doc.setFont("helvetica", "normal");
      doc.text(`Ref: ${quoteNum}`, 14, 30);
      doc.text(`Date: ${date}`, 196, 30, { align: "right" });
      if (profile?.business_name) doc.text(profile.business_name, 196, 38, { align: "right" });
    } else {
      doc.setFontSize(18); doc.setFont("helvetica", "bold");
      doc.text("Quote", 14, 18);
      doc.setFontSize(9); doc.setFont("helvetica", "normal");
      doc.text(quoteNum, 196, 14, { align: "right" });
      doc.text(date, 196, 21, { align: "right" });
      if (profile?.business_name) doc.text(profile.business_name, 196, 28, { align: "right" });
    }

    const yStart = template === "modern" || template === "branded" ? 48 : 44;
    doc.setTextColor(0, 0, 0);

    // Client block
    doc.setFontSize(9); doc.setFont("helvetica", "bold");
    doc.text("BILL TO", 14, yStart);
    doc.setFont("helvetica", "normal");
    doc.text(form.clientName, 14, yStart + 7);
    if (form.clientEmail) doc.text(form.clientEmail, 14, yStart + 14);

    // Business address on right
    if (profile?.business_address) {
      const addrLines = profile.business_address.split("\n");
      doc.setFont("helvetica", "normal");
      addrLines.forEach((line: string, i: number) => {
        doc.text(line, 196, yStart + 7 + i * 6, { align: "right" });
      });
    }

    // Line items table
    const tableY = yStart + 26;
    doc.setFillColor(230, 230, 230);
    doc.rect(14, tableY, 182, 8, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(9);
    doc.text("Description", 16, tableY + 5.5);
    doc.text("Qty", 138, tableY + 5.5, { align: "right" });
    doc.text("Unit", 163, tableY + 5.5, { align: "right" });
    doc.text("Total", 194, tableY + 5.5, { align: "right" });

    let rowY = tableY + 13;
    doc.setFont("helvetica", "normal");
    lineItems.forEach((item, i) => {
      if (i % 2 === 1) {
        doc.setFillColor(248, 248, 248);
        doc.rect(14, rowY - 5, 182, 9, "F");
      }
      doc.setTextColor(0, 0, 0);
      doc.text(item.description || "-", 16, rowY);
      doc.text(String(item.quantity), 138, rowY, { align: "right" });
      doc.text(`£${Number(item.unitPrice).toFixed(2)}`, 163, rowY, { align: "right" });
      doc.text(`£${(Number(item.quantity) * Number(item.unitPrice)).toFixed(2)}`, 194, rowY, { align: "right" });
      rowY += 9;
    });

    // Totals
    rowY += 5;
    doc.setDrawColor(220, 220, 220);
    doc.line(120, rowY, 196, rowY);
    rowY += 6;
    doc.setFontSize(9); doc.setFont("helvetica", "normal");
    doc.text("Subtotal", 120, rowY);
    doc.text(`£${subtotal.toFixed(2)}`, 194, rowY, { align: "right" });
    rowY += 7;

    if (form.vat) {
      doc.text("VAT (20%)", 120, rowY);
      doc.text(`£${vatAmount.toFixed(2)}`, 194, rowY, { align: "right" });
      rowY += 7;
    }

    doc.setFillColor(22, 163, 74);
    doc.rect(14, rowY, 182, 11, "F");
    doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(10);
    doc.text("TOTAL", 16, rowY + 7.5);
    doc.text(`£${total.toFixed(2)}`, 194, rowY + 7.5, { align: "right" });
    rowY += 18;

    // Notes
    if (form.notes.trim()) {
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold"); doc.setFontSize(9);
      doc.text("Notes", 14, rowY);
      doc.setFont("helvetica", "normal");
      const noteLines = doc.splitTextToSize(form.notes, 182);
      doc.text(noteLines, 14, rowY + 6);
      rowY += 6 + noteLines.length * 5.5 + 6;
    }

    // Signature
    if (sigData) {
      doc.setTextColor(80, 80, 80); doc.setFont("helvetica", "bold"); doc.setFontSize(9);
      doc.text("Signature", 14, rowY);
      try {
        doc.addImage(sigData, "PNG", 14, rowY + 3, 70, 25);
      } catch (e) {
        console.error("Sig embed error:", e);
      }
      doc.setDrawColor(180, 180, 180);
      doc.line(14, rowY + 30, 84, rowY + 30);
      rowY += 38;
    }

    // Footer
    doc.setFontSize(8); doc.setTextColor(180, 180, 180); doc.setFont("helvetica", "normal");
    doc.text("Generated by GetJobQuotes.uk", 105, 287, { align: "center" });

    doc.save(`quote-${form.clientName.replace(/\s+/g, "-").toLowerCase()}-${quoteNum}.pdf`);
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
              <select
                defaultValue=""
                onChange={(e) => {
                  const c = customers.find((c) => c.id === e.target.value);
                  if (c) {
                    set("clientName", c.name);
                    set("clientEmail", c.email || "");
                  }
                }}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white text-sm outline-none focus:border-green-500 transition"
              >
                <option value="">— Pick a saved customer —</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}{c.email ? ` (${c.email})` : ""}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Client Name *</label>
            <input
              value={form.clientName}
              onChange={(e) => set("clientName", e.target.value)}
              placeholder="John Smith"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Client Email</label>
            <input
              value={form.clientEmail}
              onChange={(e) => set("clientEmail", e.target.value)}
              placeholder="client@email.com"
              type="email"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Job Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Brief summary of the work..."
              rows={2}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition resize-none"
            />
          </div>
        </div>

        {/* Line items */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest">Line Items</h2>
          <div className="grid grid-cols-12 gap-2 text-xs text-zinc-500 px-1">
            <span className="col-span-6">Description</span>
            <span className="col-span-2 text-center">Qty</span>
            <span className="col-span-3 text-right">Price (£)</span>
            <span className="col-span-1" />
          </div>
          {lineItems.map((item, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <input
                value={item.description}
                onChange={(e) => updateItem(i, "description", e.target.value)}
                placeholder="e.g. Labour"
                className="col-span-6 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition"
              />
              <input
                value={item.quantity}
                onChange={(e) => updateItem(i, "quantity", e.target.value)}
                type="number" min="0"
                className="col-span-2 rounded-xl border border-zinc-700 bg-zinc-950 px-2 py-2.5 text-white text-sm outline-none focus:border-green-500 transition text-center"
              />
              <input
                value={item.unitPrice}
                onChange={(e) => updateItem(i, "unitPrice", e.target.value)}
                type="number" min="0" step="0.01"
                className="col-span-3 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white text-sm outline-none focus:border-green-500 transition text-right"
              />
              <button
                onClick={() => removeItem(i)}
                className="col-span-1 text-zinc-600 hover:text-red-400 text-xl text-center transition leading-none"
              >×</button>
            </div>
          ))}
          <button onClick={addItem} className="text-sm text-green-400 hover:text-green-300 transition font-medium">
            + Add Line Item
          </button>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => set("vat", !form.vat)}
                className={`w-11 h-6 rounded-full transition-colors relative ${form.vat ? "bg-green-600" : "bg-zinc-700"}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.vat ? "left-6" : "left-1"}`} />
              </div>
              <span className="text-sm text-zinc-300">Add VAT (20%)</span>
            </label>
          </div>
        </div>

        {/* Total */}
        <div className="rounded-2xl border border-green-600/30 bg-green-600/5 p-5 space-y-1.5">
          {lineItems.filter(i => i.description).map((item, i) => (
            <div key={i} className="flex justify-between text-sm text-zinc-400">
              <span>{item.description} ×{item.quantity}</span>
              <span>£{(Number(item.quantity) * Number(item.unitPrice)).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm text-zinc-400 pt-2 border-t border-zinc-800">
            <span>Subtotal</span><span>£{subtotal.toFixed(2)}</span>
          </div>
          {form.vat && (
            <div className="flex justify-between text-sm text-zinc-400">
              <span>VAT (20%)</span><span>£{vatAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-zinc-800">
            <span>Total</span>
            <span className="text-green-400">£{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest mb-3">Notes</h2>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Payment terms, validity, any extra info for the client..."
            rows={3}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition resize-none"
          />
        </div>

        {/* Signature */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest">Your Signature</h2>
            <button
              onClick={() => setShowSig((v) => !v)}
              className="text-xs text-green-400 hover:text-green-300 transition"
            >
              {showSig ? "Done" : hasSig ? "Edit Signature" : "Add Signature"}
            </button>
          </div>

          {!showSig && hasSig && sigData && (
            <div className="flex items-center gap-3">
              <img src={sigData} alt="Signature" className="h-14 rounded-lg bg-zinc-900 border border-zinc-700 p-1" />
              <button onClick={clearSig} className="text-xs text-zinc-500 hover:text-red-400 transition">Remove</button>
            </div>
          )}

          {!showSig && !hasSig && (
            <p className="text-xs text-zinc-600">No signature yet. Click "Add Signature" to sign with your mouse or finger.</p>
          )}

          {showSig && (
            <div>
              <p className="text-xs text-zinc-500 mb-2">Draw your signature below:</p>
              <canvas
                ref={sigCanvasRef}
                width={600}
                height={150}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-700 cursor-crosshair touch-none"
                style={{ touchAction: "none" }}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
              />
              <div className="flex gap-4 mt-2">
                <button onClick={clearSig} className="text-xs text-zinc-500 hover:text-red-400 transition">Clear</button>
                <button
                  onClick={() => {
                    if (sigCanvasRef.current && hasSig) {
                      setSigData(sigCanvasRef.current.toDataURL("image/png"));
                    }
                    setShowSig(false);
                  }}
                  className="text-xs text-green-400 hover:text-green-300 font-semibold transition"
                >
                  Save Signature
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Template */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest mb-4">PDF Template</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(["minimal", "modern", "formal", "branded"] as Template[]).map((t) => (
              <button
                key={t}
                onClick={() => setTemplate(t)}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold capitalize border transition ${
                  template === t ? "bg-green-600 border-green-600 text-white" : "border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        {saveMsg && (
          <p className={`text-center text-sm ${saveMsg.startsWith("Error") ? "text-red-400" : "text-yellow-400"}`}>
            {saveMsg}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3.5 rounded-xl bg-green-600 hover:bg-green-500 text-sm font-bold text-white transition disabled:opacity-50"
          >
            {saving ? "Saving..." : editId ? "Update Quote" : "Save Quote"}
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 py-3.5 rounded-xl border border-zinc-700 hover:border-zinc-500 text-sm font-semibold text-zinc-300 hover:text-white transition"
          >
            ↓ Download PDF
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
echo "✅ app/tool/page.tsx fixed"

# ============================================================
# 3. Commit and push
# ============================================================
git add .
git commit -m "fix: profile saving, logo upload error handling, signature canvas"
git push origin main

echo ""
echo "✅ Done! Deploying to Vercel now."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  SUPABASE CHECKLIST (do these manually):"
echo ""
echo "1. SQL Editor — run this if you haven't already:"
echo "   CREATE TABLE IF NOT EXISTS profiles ("
echo "     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),"
echo "     user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,"
echo "     business_name text, business_email text,"
echo "     business_phone text, business_address text,"
echo "     logo_url text, created_at timestamptz DEFAULT now()"
echo "   );"
echo "   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;"
echo "   CREATE POLICY \"Users manage own profile\" ON profiles"
echo "     FOR ALL USING (auth.uid() = user_id);"
echo ""
echo "2. Storage → New bucket → name: logos → tick Public ✓"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
