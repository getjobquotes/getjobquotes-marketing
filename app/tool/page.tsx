"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import TopNav from "@/components/TopNav";
import jsPDF from "jspdf";

type Template = "minimal" | "modern" | "formal" | "branded";

function QuoteForm() {
  const supabase = createClient();
  const router = useRouter();
  const params = useSearchParams();
  const editId = params.get("id");

  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [template, setTemplate] = useState<Template>("modern");

  const [form, setForm] = useState({
    clientName: "",
    clientEmail: "",
    description: "",
    labourCost: "",
    materialsCost: "",
    vat: false,
  });

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      setUser(user);

      if (editId) {
        const { data } = await supabase.from("documents").select("*").eq("id", editId).single();
        if (data) {
          setForm({
            clientName: data.client_name,
            clientEmail: data.client_email || "",
            description: data.description,
            labourCost: String(data.labour_cost),
            materialsCost: String(data.materials_cost),
            vat: data.vat,
          });
        }
      }
    };
    init();
  }, []);

  const labour = parseFloat(form.labourCost) || 0;
  const materials = parseFloat(form.materialsCost) || 0;
  const subtotal = labour + materials;
  const vatAmount = form.vat ? subtotal * 0.2 : 0;
  const total = subtotal + vatAmount;

  const set = (key: string, val: any) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!form.clientName || !form.description) {
      alert("Please fill in client name and job description.");
      return;
    }
    setSaving(true);
    const number = editId ? undefined : "QUO-" + Date.now().toString().slice(-6);
    const payload = {
      user_id: user.id,
      type: "quote",
      number,
      client_name: form.clientName,
      client_email: form.clientEmail,
      description: form.description,
      labour_cost: labour,
      materials_cost: materials,
      vat: form.vat,
      total,
      status: "pending",
    };

    if (editId) {
      await supabase.from("documents").update(payload).eq("id", editId);
    } else {
      await supabase.from("documents").insert(payload);
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => router.push("/dashboard"), 1500);
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    const quoteNum = "QUO-" + Date.now().toString().slice(-6);
    const date = new Date().toLocaleDateString("en-GB");

    if (template === "modern") {
      doc.setFillColor(18, 18, 18);
      doc.rect(0, 0, 210, 40, "F");
      doc.setTextColor(34, 197, 94);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("QUOTE", 14, 18);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text(quoteNum, 14, 28);
      doc.text(date, 14, 35);
    } else if (template === "formal") {
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("QUOTE", 105, 20, { align: "center" });
      doc.setDrawColor(0);
      doc.line(14, 25, 196, 25);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Ref: ${quoteNum}`, 14, 33);
      doc.text(`Date: ${date}`, 196, 33, { align: "right" });
    } else if (template === "branded") {
      doc.setFillColor(22, 163, 74);
      doc.rect(0, 0, 8, 297, "F");
      doc.setFillColor(22, 163, 74);
      doc.rect(0, 0, 210, 32, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("GetJobQuotes", 20, 15);
      doc.setFontSize(10);
      doc.text(`QUOTE · ${quoteNum} · ${date}`, 20, 25);
    } else {
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Quote", 14, 20);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(quoteNum, 196, 15, { align: "right" });
      doc.text(date, 196, 22, { align: "right" });
    }

    const yStart = template === "branded" ? 45 : template === "modern" ? 55 : 45;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Client", 14, yStart);
    doc.setFont("helvetica", "normal");
    doc.text(form.clientName, 14, yStart + 7);
    if (form.clientEmail) doc.text(form.clientEmail, 14, yStart + 14);

    const y2 = yStart + 30;
    doc.setFont("helvetica", "bold");
    doc.text("Job Description", 14, y2);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(form.description, 182);
    doc.text(lines, 14, y2 + 8);

    const y3 = y2 + 8 + lines.length * 7 + 10;
    doc.setFillColor(245, 245, 245);
    doc.rect(14, y3, 182, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.text("Item", 16, y3 + 5.5);
    doc.text("Amount", 180, y3 + 5.5, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.text("Labour", 16, y3 + 15);
    doc.text(`£${labour.toFixed(2)}`, 180, y3 + 15, { align: "right" });
    doc.text("Materials", 16, y3 + 23);
    doc.text(`£${materials.toFixed(2)}`, 180, y3 + 23, { align: "right" });

    if (form.vat) {
      doc.text("VAT (20%)", 16, y3 + 31);
      doc.text(`£${vatAmount.toFixed(2)}`, 180, y3 + 31, { align: "right" });
    }

    const y4 = y3 + (form.vat ? 40 : 32);
    doc.setFillColor(22, 163, 74);
    doc.rect(14, y4, 182, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL", 16, y4 + 7);
    doc.text(`£${total.toFixed(2)}`, 180, y4 + 7, { align: "right" });

    doc.save(`quote-${form.clientName.replace(/\s+/g, "-").toLowerCase()}.pdf`);
  };

  if (saved) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-white mb-2">Quote saved!</h2>
        <p className="text-zinc-400 text-sm">Redirecting you to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">{editId ? "Edit Quote" : "New Quote"}</h1>
        <p className="text-zinc-400 text-sm">Fill in the details below to generate a professional PDF quote.</p>
      </div>

      <div className="space-y-5">

        {/* Client details */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest">Client Details</h2>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Client Name *</label>
            <input value={form.clientName} onChange={(e) => set("clientName", e.target.value)}
              placeholder="John Smith"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition" />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Client Email</label>
            <input value={form.clientEmail} onChange={(e) => set("clientEmail", e.target.value)}
              placeholder="client@email.com" type="email"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition" />
          </div>
        </div>

        {/* Job details */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest">Job Details</h2>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Job Description *</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
              placeholder="e.g. Full bathroom refit including new tiles, fixtures and plumbing..."
              rows={4}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Labour Cost (£)</label>
              <input value={form.labourCost} onChange={(e) => set("labourCost", e.target.value)}
                placeholder="0.00" type="number" min="0"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Materials Cost (£)</label>
              <input value={form.materialsCost} onChange={(e) => set("materialsCost", e.target.value)}
                placeholder="0.00" type="number" min="0"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition" />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => set("vat", !form.vat)}
              className={`w-11 h-6 rounded-full transition-colors ${form.vat ? "bg-green-600" : "bg-zinc-700"} relative`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.vat ? "left-6" : "left-1"}`} />
            </div>
            <span className="text-sm text-zinc-300">Add VAT (20%)</span>
          </label>
        </div>

        {/* Total */}
        <div className="rounded-2xl border border-green-600/30 bg-green-600/5 p-6">
          <div className="flex justify-between items-center text-sm text-zinc-400 mb-2">
            <span>Subtotal</span><span>£{subtotal.toFixed(2)}</span>
          </div>
          {form.vat && (
            <div className="flex justify-between items-center text-sm text-zinc-400 mb-2">
              <span>VAT (20%)</span><span>£{vatAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-xl font-bold text-white pt-2 border-t border-zinc-800">
            <span>Total</span><span className="text-green-400">£{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Template picker */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest mb-4">PDF Template</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(["minimal", "modern", "formal", "branded"] as Template[]).map((t) => (
              <button key={t} onClick={() => setTemplate(t)}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold capitalize border transition ${
                  template === t
                    ? "bg-green-600 border-green-600 text-white"
                    : "border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600"
                }`}>
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
