"use client";
import { createClient } from "@/lib/supabase/client";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import TopNav from "@/components/TopNav";
import { usePlan } from "@/lib/usePlan";
import UpgradePrompt from "@/components/UpgradePrompt";
import jsPDF from "jspdf";

type LineItem = { description: string; quantity: number; unitPrice: number };

const fmtMoney = (n: number) =>
  `£${Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`;

function buildPDF(opts: {
  form: any;
  lineItems: LineItem[];
  subtotal: number;
  vatAmount: number;
  total: number;
  sigData: string;
  profile: any;
  docId: string | null;
}): jsPDF {
  const { form, lineItems, subtotal, vatAmount, total, sigData, profile, docId } = opts;
  const doc = new jsPDF();
  const ref = docId
    ? `${form.type === "invoice" ? "INV" : "QUO"}-${docId.slice(-6).toUpperCase()}`
    : `${form.type === "invoice" ? "INV" : "QUO"}-${Date.now().toString().slice(-6)}`;
  const date = new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });

  // Header
  doc.setFillColor(15, 15, 15);
  doc.rect(0, 0, 210, 38, "F");
  doc.setTextColor(34, 197, 94);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(form.type === "invoice" ? "INVOICE" : "QUOTE", 14, 17);
  doc.setTextColor(180, 180, 180);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Ref: ${ref}`, 14, 27);
  doc.text(`Date: ${date}`, 14, 34);

  // Business info
  if (profile?.business_name) {
    doc.setTextColor(220, 220, 220);
    doc.setFont("helvetica", "bold");
    doc.text(profile.business_name, 196, 10, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 150);
    let by = 16;
    if (profile.business_email) { doc.text(profile.business_email, 196, by, { align: "right" }); by += 5; }
    if (profile.business_phone) { doc.text(profile.business_phone, 196, by, { align: "right" }); }
  }

  // Logo
  if (profile?.logo_url) {
    try { doc.addImage(profile.logo_url, "PNG", 14, 42, 28, 14); } catch {}
  }

  // Bill to
  const billY = profile?.logo_url ? 62 : 48;
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("BILL TO", 14, billY);
  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(form.clientName || "—", 14, billY + 7);
  if (form.clientEmail) doc.text(form.clientEmail, 14, billY + 13);
  if (form.clientPhone) doc.text(form.clientPhone, 14, billY + 19);
  if (form.description) {
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(8);
    doc.text(doc.splitTextToSize(`Job: ${form.description}`, 182), 14, billY + 26);
  }

  // Table header
  let tableY = billY + 38;
  doc.setFillColor(240, 240, 240);
  doc.rect(14, tableY, 182, 8, "F");
  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Description", 16, tableY + 5.5);
  doc.text("Qty", 135, tableY + 5.5, { align: "right" });
  doc.text("Unit price", 162, tableY + 5.5, { align: "right" });
  doc.text("Total", 194, tableY + 5.5, { align: "right" });

  // Line items
  let rowY = tableY + 13;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  lineItems.forEach((item, i) => {
    if (!item.description && !item.unitPrice) return;
    if (i % 2 === 1) {
      doc.setFillColor(250, 250, 250);
      doc.rect(14, rowY - 5.5, 182, 9, "F");
    }
    doc.setTextColor(20, 20, 20);
    const lines = doc.splitTextToSize(item.description || "—", 110);
    doc.text(lines, 16, rowY);
    doc.text(String(item.quantity), 135, rowY, { align: "right" });
    doc.text(`£${Number(item.unitPrice).toFixed(2)}`, 162, rowY, { align: "right" });
    doc.text(`£${(Number(item.quantity) * Number(item.unitPrice)).toFixed(2)}`, 194, rowY, { align: "right" });
    rowY += lines.length > 1 ? lines.length * 5 + 4 : 9;
  });

  // Totals
  rowY += 6;
  doc.setDrawColor(220, 220, 220);
  doc.line(120, rowY - 3, 194, rowY - 3);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  doc.text("Subtotal", 120, rowY);
  doc.text(`£${subtotal.toFixed(2)}`, 194, rowY, { align: "right" });
  rowY += 7;
  if (form.vat) {
    doc.text("VAT (20%)", 120, rowY);
    doc.text(`£${vatAmount.toFixed(2)}`, 194, rowY, { align: "right" });
    rowY += 7;
  }
  doc.setFillColor(22, 163, 74);
  doc.rect(14, rowY, 182, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("TOTAL", 16, rowY + 8);
  doc.text(`£${total.toFixed(2)}`, 194, rowY + 8, { align: "right" });
  rowY += 19;

  // Notes
  if (form.notes) {
    doc.setTextColor(80, 80, 80);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("NOTES", 14, rowY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    const nLines = doc.splitTextToSize(form.notes, 182);
    doc.text(nLines, 14, rowY + 7);
    rowY += nLines.length * 5 + 12;
  }

  // Signature
  if (sigData) {
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("AUTHORISED SIGNATURE", 14, rowY);
    try { doc.addImage(sigData, "PNG", 14, rowY + 3, 65, 22); } catch {}
  }

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(180, 180, 180);
  doc.setFont("helvetica", "normal");
  doc.text("Generated by GetJobQuotes.uk", 105, 287, { align: "center" });

  return doc;
}

function ToolInner() {
  const supabase = createClient();
  const auth = useAuthGuard();
  const plan = usePlan(auth.status === "authenticated" ? auth.user.id : null);
  const router = useRouter();
  const params = useSearchParams();
  const editId = params.get("id");
  const customerId = params.get("customer");

  const sigRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const [profile, setProfile] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sigData, setSigData] = useState("");
  const [hasSig, setHasSig] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsError, setShowTermsError] = useState(false);

  const [form, setForm] = useState({
    clientName: "", clientEmail: "", clientPhone: "",
    description: "", vat: false, notes: "",
    expiryDays: "30", type: "quote" as "quote" | "invoice",
  });
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);

  const subtotal = lineItems.reduce(
    (s, i) => s + Number(i.quantity) * Number(i.unitPrice), 0
  );
  const vatAmount = form.vat ? subtotal * 0.2 : 0;
  const total = subtotal + vatAmount;

  // Load data
  useEffect(() => {
    if (auth.status !== "authenticated") return;
    const user = auth.user;

    Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("customers").select("*").eq("user_id", user.id).order("name"),
    ]).then(([{ data: prof }, { data: custs }]) => {
      if (prof) {
        setProfile(prof);
        if (prof.signature_data) { setSigData(prof.signature_data); setHasSig(true); }
      }
      setCustomers(custs || []);
    });

    if (editId) {
      supabase.from("documents").select("*").eq("id", editId).single()
        .then(({ data: doc }) => {
          if (!doc) return;
          setForm({
            clientName: doc.client_name || "",
            clientEmail: doc.client_email || "",
            clientPhone: "",
            description: doc.description || "",
            vat: doc.vat || false,
            notes: doc.notes || "",
            expiryDays: "30",
            type: doc.type || "quote",
          });
          if (doc.line_items?.length) setLineItems(doc.line_items);
          if (doc.signature_data) { setSigData(doc.signature_data); setHasSig(true); }
        });
    } else if (customerId) {
      supabase.from("customers").select("*").eq("id", customerId).single()
        .then(({ data: c }) => {
          if (c) setForm(p => ({ ...p, clientName: c.name, clientEmail: c.email || "", clientPhone: c.phone || "" }));
        });
    } else {
      try {
        const raw = localStorage.getItem("gjq_draft_quote");
        if (raw) {
          const d = JSON.parse(raw);
          const age = (Date.now() - new Date(d.savedAt).getTime()) / 3600000;
          if (age < 24 && d.form?.clientName &&
            window.confirm(`Restore draft for "${d.form.clientName}"?`)) {
            setForm(d.form);
            if (d.lineItems?.length) setLineItems(d.lineItems);
            if (d.sigData) { setSigData(d.sigData); setHasSig(true); }
          } else {
            localStorage.removeItem("gjq_draft_quote");
          }
        }
      } catch {}
    }
  }, [auth.status]);

  // Auto-save draft
  useEffect(() => {
    if (auth.status !== "authenticated" || editId) return;
    const t = setInterval(() => {
      localStorage.setItem("gjq_draft_quote", JSON.stringify({
        form, lineItems, sigData, savedAt: new Date().toISOString(),
      }));
    }, 30000);
    return () => clearInterval(t);
  }, [auth.status, form, lineItems, sigData, editId]);

  // PDF preview
  useEffect(() => {
    if (!showPreview) return;
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => {
      setPreviewLoading(true);
      try {
        const uri = buildPDF({ form, lineItems, subtotal, vatAmount, total, sigData, profile, docId: editId }).output("datauristring");
        if (previewRef.current) previewRef.current.src = uri;
      } catch (e) {
        console.error("Preview error:", e);
      }
      setPreviewLoading(false);
    }, 700);
    return () => { if (previewTimer.current) clearTimeout(previewTimer.current); };
  }, [form, lineItems, sigData, showPreview, profile]);

  // Signature drawing
  const getPos = (e: any, c: HTMLCanvasElement) => {
    const r = c.getBoundingClientRect();
    if (e.touches) return {
      x: (e.touches[0].clientX - r.left) * (c.width / r.width),
      y: (e.touches[0].clientY - r.top) * (c.height / r.height),
    };
    return {
      x: (e.clientX - r.left) * (c.width / r.width),
      y: (e.clientY - r.top) * (c.height / r.height),
    };
  };
  const startDraw = (e: any) => {
    e.preventDefault();
    isDrawing.current = true;
    lastPos.current = getPos(e, sigRef.current!);
  };
  const drawSig = (e: any) => {
    e.preventDefault();
    if (!isDrawing.current || !lastPos.current || !sigRef.current) return;
    const ctx = sigRef.current.getContext("2d")!;
    const pos = getPos(e, sigRef.current);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.stroke();
    lastPos.current = pos;
    setHasSig(true);
    setSigData(sigRef.current.toDataURL("image/png"));
  };
  const endDraw = (e: any) => {
    e.preventDefault();
    isDrawing.current = false;
    lastPos.current = null;
  };

  const handleSave = async () => {
    if (!termsAccepted) { setShowTermsError(true); return; }
    if (auth.status !== "authenticated" || !form.clientName) return;
    if (!editId && plan.limitReached) return;
    setSaving(true);
    // Sanitise inputs before saving
    const sanitize = (s: string) => s.trim().slice(0, 500);

    const payload = {
      user_id: auth.user.id,
      type: form.type,
      number: editId ? undefined : `${form.type === "invoice" ? "INV" : "QUO"}-${Date.now().toString().slice(-6)}`,
      client_name: sanitize(form.clientName),
      client_email: sanitize(form.clientEmail).toLowerCase(),
      description: sanitize(form.description),
      vat: form.vat,
      total,
      status: "pending",
      line_items: lineItems,
      notes: form.notes,
      signature_data: sigData || null,
      expires_at: form.expiryDays !== "none"
        ? new Date(Date.now() + parseInt(form.expiryDays) * 86400000).toISOString()
        : null,
    };
    if (editId) {
      await supabase.from("documents").update(payload).eq("id", editId);
    } else {
      await supabase.from("documents").insert(payload);
    }
    localStorage.removeItem("gjq_draft_quote");
    setSaved(true);
    setSaving(false);
    setTimeout(() => router.push("/dashboard"), 1200);
  };

  const setF = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));
  const updateItem = (i: number, k: keyof LineItem, v: any) =>
    setLineItems(p => p.map((item, idx) => idx === i ? { ...item, [k]: v } : item));

  if (auth.status === "loading") return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-zinc-600 text-sm animate-pulse">Loading...</p>
    </div>
  );
  if (auth.status === "unauthenticated") return null;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">

        {/* Form panel */}
        <div className="w-full max-w-2xl mx-auto overflow-y-auto">
          <div className="px-5 py-5 space-y-4">

            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">
                {editId ? "Edit" : "New"} {form.type === "invoice" ? "Invoice" : "Quote"}
              </h1>
              <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs">
                {(["quote", "invoice"] as const).map(t => (
                  <button key={t} onClick={() => setF("type", t)}
                    className={`px-3 py-1.5 rounded-full font-medium capitalize transition ${
                      form.type === t ? "bg-green-600 text-white" : "text-zinc-400 hover:text-white"
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer picker */}
            {customers.length > 0 && (
              <select onChange={e => {
                const c = customers.find(c => c.id === e.target.value);
                if (c) setForm(p => ({ ...p, clientName: c.name, clientEmail: c.email || "", clientPhone: c.phone || "" }));
              }} className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-white text-sm outline-none focus:border-green-500 transition">
                <option value="">— Fill from saved customer —</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}

            {/* Client */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Client</p>
              {[
                { k: "clientName", label: "Name *", ph: "John Smith", type: "text" },
                { k: "clientEmail", label: "Email", ph: "john@email.com", type: "email" },
                { k: "clientPhone", label: "Phone", ph: "07700 900000", type: "tel" },
              ].map(f => (
                <div key={f.k}>
                  <label className="text-xs text-zinc-600 mb-1 block">{f.label}</label>
                  <input type={f.type} value={(form as any)[f.k]}
                    onChange={e => setF(f.k, e.target.value)} placeholder={f.ph}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition" />
                </div>
              ))}
              <div>
                <label className="text-xs text-zinc-600 mb-1 block">Job Description</label>
                <textarea value={form.description} onChange={e => setF("description", e.target.value)}
                  placeholder="e.g. New boiler installation..." rows={2}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition resize-none" />
              </div>
            </div>

            {/* Line items */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Line Items</p>
              <div className="grid grid-cols-12 gap-1 text-xs text-zinc-600 px-1">
                <span className="col-span-6">Description</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-4 text-right">Unit £</span>
              </div>
              {lineItems.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-1 items-center">
                  <input value={item.description} onChange={e => updateItem(i, "description", e.target.value)}
                    placeholder="Labour / parts"
                    className="col-span-6 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-white text-xs placeholder:text-zinc-600 outline-none focus:border-green-500 transition" />
                  <input value={item.quantity} onChange={e => updateItem(i, "quantity", e.target.value)}
                    type="number" min="0"
                    className="col-span-2 rounded-lg border border-zinc-700 bg-zinc-950 px-1 py-2 text-white text-xs outline-none focus:border-green-500 transition text-center" />
                  <input value={item.unitPrice} onChange={e => updateItem(i, "unitPrice", e.target.value)}
                    type="number" min="0" step="0.01"
                    className="col-span-3 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-white text-xs outline-none focus:border-green-500 transition text-right" />
                  {lineItems.length > 1 && (
                    <button onClick={() => setLineItems(p => p.filter((_, idx) => idx !== i))}
                      className="col-span-1 text-zinc-700 hover:text-red-400 text-lg transition text-center">×</button>
                  )}
                </div>
              ))}
              <button onClick={() => setLineItems(p => [...p, { description: "", quantity: 1, unitPrice: 0 }])}
                className="text-xs text-green-400 hover:text-green-300 transition">+ Add item</button>
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <div onClick={() => setF("vat", !form.vat)}
                  className={`w-9 h-5 rounded-full relative transition-colors shrink-0 ${form.vat ? "bg-green-600" : "bg-zinc-700"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.vat ? "left-4" : "left-0.5"}`} />
                </div>
                <span className="text-xs text-zinc-400">Include VAT (20%)</span>
              </label>
            </div>

            {/* Total */}
            <div className="rounded-xl border border-green-600/20 bg-green-600/5 px-4 py-3">
              {form.vat && (
                <>
                  <div className="flex justify-between text-xs text-zinc-500 mb-1">
                    <span>Subtotal</span><span>{fmtMoney(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-500 mb-2">
                    <span>VAT (20%)</span><span>{fmtMoney(vatAmount)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-green-400">{fmtMoney(total)}</span>
              </div>
            </div>

            {/* Options */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Valid for</label>
                <select value={form.expiryDays} onChange={e => setF("expiryDays", e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white text-sm outline-none focus:border-green-500 transition">
                  {[["7","7 days"],["14","14 days"],["30","30 days"],["60","60 days"],["none","No expiry"]].map(([v,l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Notes / payment terms</label>
                <textarea value={form.notes} onChange={e => setF("notes", e.target.value)}
                  placeholder="Payment due within 30 days..." rows={2}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition resize-none" />
              </div>
            </div>

            {/* Signature */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Signature</p>
                {hasSig && (
                  <button onClick={() => {
                    sigRef.current?.getContext("2d")?.clearRect(0, 0, 600, 100);
                    setSigData(""); setHasSig(false);
                  }} className="text-xs text-zinc-600 hover:text-red-400 transition">Clear</button>
                )}
              </div>
              {profile?.signature_data && !hasSig && (
                <div className="flex items-center gap-3 mb-2">
                  <img src={profile.signature_data} className="h-10 rounded border border-zinc-700 bg-zinc-900 p-1" alt="sig" />
                  <button onClick={() => { setSigData(profile.signature_data); setHasSig(true); }}
                    className="text-xs text-green-400 hover:text-green-300 transition">Use saved</button>
                </div>
              )}
              <canvas ref={sigRef} width={600} height={100}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-700 cursor-crosshair touch-none"
                style={{ touchAction: "none" }}
                onMouseDown={startDraw} onMouseMove={drawSig} onMouseUp={endDraw} onMouseLeave={endDraw}
                onTouchStart={startDraw} onTouchMove={drawSig} onTouchEnd={endDraw} />
            </div>

                        {/* Quota bar */}
            {!plan.loading && !plan.isPro && !editId && (
              <div className={`rounded-xl border px-4 py-3 ${plan.limitReached ? "border-red-500/30 bg-red-500/10" : "border-zinc-800 bg-zinc-900/50"}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-500">Free quotes this month</span>
                  <span className={`text-xs font-semibold ${plan.limitReached ? "text-red-400" : "text-zinc-300"}`}>
                    {plan.quotesThisMonth} / 5
                  </span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${plan.limitReached ? "bg-red-500" : plan.quotesThisMonth >= 4 ? "bg-yellow-500" : "bg-green-500"}`}
                    style={{ width: `${Math.min(100, (plan.quotesThisMonth / 5) * 100)}%` }} />
                </div>
                {plan.limitReached
                  ? <p className="text-xs text-red-400 mt-1.5">Limit reached — <a href="/pricing" className="underline">upgrade to Pro</a></p>
                  : <p className="text-xs text-zinc-600 mt-1.5">{plan.quotesRemaining} quote{plan.quotesRemaining !== 1 ? "s" : ""} remaining</p>
                }
              </div>
            )}

{/* T&C */}
            <div className={`rounded-2xl border p-4 transition ${showTermsError ? "border-red-500/50 bg-red-500/5" : "border-zinc-800 bg-zinc-900/50"}`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <div onClick={() => { setTermsAccepted(v => !v); setShowTermsError(false); }}
                  className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition ${termsAccepted ? "bg-green-600 border-green-600" : "border-zinc-600 hover:border-green-500"}`}>
                  {termsAccepted && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-xs text-zinc-400 leading-relaxed">
                  I confirm this {form.type} is accurate and I accept the{" "}
                  <a href="/terms" target="_blank" className="text-green-400 hover:underline">Terms & Conditions</a>.
                </span>
              </label>
              {showTermsError && <p className="text-red-400 text-xs mt-2 pl-8">Please accept the terms before saving.</p>}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pb-6">
              <button onClick={() => {
                buildPDF({ form, lineItems, subtotal, vatAmount, total, sigData, profile, docId: editId })
                  .save(`${form.type}-${form.clientName || "quote"}.pdf`);
              }} className="py-3 rounded-xl border border-zinc-700 hover:border-zinc-500 text-sm font-semibold text-zinc-300 hover:text-white transition">
                ↓ Download PDF
              </button>
              <button onClick={handleSave} disabled={saving || saved || !form.clientName}
                className="py-3 rounded-xl bg-green-600 hover:bg-green-500 text-sm font-bold text-white transition disabled:opacity-50">
                {saved ? "✓ Saved!" : saving ? "Saving..." : `Save ${form.type === "invoice" ? "Invoice" : "Quote"}`}
              </button>
            </div>
          </div>
        </div>

        {/* Upgrade prompt */}
      {!editId && plan.limitReached && (
        <UpgradePrompt quotesUsed={plan.quotesThisMonth} />
      )}

{/* Mobile preview modal */}
        {showPreview && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/95 flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-900">
              <span className="text-sm font-semibold">PDF Preview</span>
              </div>
            <iframe ref={previewRef} className="flex-1 w-full border-0" title="PDF Preview Mobile" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function ToolPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ToolInner />
    </Suspense>
  );
}
