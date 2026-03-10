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
