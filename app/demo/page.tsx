"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import jsPDF from "jspdf";

type LineItem = { description: string; quantity: number; unitPrice: number };

export default function DemoPage() {
  const [form, setForm] = useState({ clientName: "", clientEmail: "", description: "", vat: false, notes: "" });
  const [lineItems, setLineItems] = useState<LineItem[]>([{ description: "", quantity: 1, unitPrice: 0 }]);
  const [showWall, setShowWall] = useState(false);
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [hasSig, setHasSig] = useState(false);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const updateItem = (i: number, k: keyof LineItem, v: any) =>
    setLineItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [k]: v } : item));

  const subtotal = lineItems.reduce((s, i) => s + Number(i.quantity) * Number(i.unitPrice), 0);
  const vatAmount = form.vat ? subtotal * 0.2 : 0;
  const total = subtotal + vatAmount;

  const getPos = (e: any, c: HTMLCanvasElement) => {
    const r = c.getBoundingClientRect();
    if (e.touches) return { x: (e.touches[0].clientX - r.left) * (c.width / r.width), y: (e.touches[0].clientY - r.top) * (c.height / r.height) };
    return { x: (e.clientX - r.left) * (c.width / r.width), y: (e.clientY - r.top) * (c.height / r.height) };
  };
  const startDraw = (e: any) => { e.preventDefault(); isDrawing.current = true; lastPos.current = getPos(e, sigCanvasRef.current!); };
  const drawSig = (e: any) => {
    e.preventDefault();
    if (!isDrawing.current || !lastPos.current || !sigCanvasRef.current) return;
    const ctx = sigCanvasRef.current.getContext("2d")!;
    const pos = getPos(e, sigCanvasRef.current);
    ctx.beginPath(); ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y); ctx.strokeStyle = "#22c55e"; ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.stroke();
    lastPos.current = pos; setHasSig(true);
  };
  const endDraw = (e: any) => { e.preventDefault(); isDrawing.current = false; lastPos.current = null; };

  // Save data for post-signup import
  const saveDemoToStorage = () => {
    const sigData = hasSig && sigCanvasRef.current ? sigCanvasRef.current.toDataURL("image/png") : null;
    localStorage.setItem("gjq_demo_import", JSON.stringify({
      form, lineItems, sigData, total, subtotal, vatAmount,
      savedAt: new Date().toISOString(),
    }));
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const ref = "DEMO-" + Date.now().toString().slice(-6);
    doc.setFillColor(18, 18, 18); doc.rect(0, 0, 210, 36, "F");
    doc.setTextColor(34, 197, 94); doc.setFontSize(20); doc.setFont("helvetica", "bold"); doc.text("QUOTE", 14, 17);
    doc.setTextColor(200, 200, 200); doc.setFontSize(9); doc.setFont("helvetica", "normal");
    doc.text(`Ref: ${ref}`, 14, 26); doc.text(new Date().toLocaleDateString("en-GB"), 14, 33);
    doc.setTextColor(130, 130, 130); doc.text("Demo — sign up to save", 196, 26, { align: "right" });

    doc.setTextColor(0); doc.setFont("helvetica", "bold"); doc.setFontSize(9);
    doc.text("BILL TO", 14, 49); doc.setFont("helvetica", "normal");
    doc.text(form.clientName || "Client", 14, 57);

    let y = 68;
    doc.setFillColor(230, 230, 230); doc.rect(14, y, 182, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.text("Description", 16, y + 5.5); doc.text("Qty", 138, y + 5.5, { align: "right" });
    doc.text("Unit", 163, y + 5.5, { align: "right" }); doc.text("Total", 194, y + 5.5, { align: "right" });
    y += 13; doc.setFont("helvetica", "normal");
    lineItems.forEach((item, i) => {
      if (i % 2) { doc.setFillColor(248, 248, 248); doc.rect(14, y - 5, 182, 9, "F"); }
      doc.setTextColor(0);
      doc.text(item.description || "-", 16, y);
      doc.text(String(item.quantity), 138, y, { align: "right" });
      doc.text(`£${Number(item.unitPrice).toFixed(2)}`, 163, y, { align: "right" });
      doc.text(`£${(Number(item.quantity) * Number(item.unitPrice)).toFixed(2)}`, 194, y, { align: "right" });
      y += 9;
    });

    y += 5;
    doc.setTextColor(0); doc.text("Subtotal", 120, y); doc.text(`£${subtotal.toFixed(2)}`, 194, y, { align: "right" }); y += 7;
    if (form.vat) { doc.text("VAT (20%)", 120, y); doc.text(`£${vatAmount.toFixed(2)}`, 194, y, { align: "right" }); y += 7; }
    doc.setFillColor(22, 163, 74); doc.rect(14, y, 182, 11, "F");
    doc.setTextColor(255); doc.setFont("helvetica", "bold");
    doc.text("TOTAL", 16, y + 7.5); doc.text(`£${total.toFixed(2)}`, 194, y + 7.5, { align: "right" });
    y += 18;
    if (form.notes) { doc.setTextColor(0); doc.setFont("helvetica", "normal"); doc.text(form.notes, 14, y, { maxWidth: 182 }); y += 10; }
    if (hasSig && sigCanvasRef.current) { try { doc.addImage(sigCanvasRef.current.toDataURL("image/png"), "PNG", 14, y, 70, 22); } catch {} }
    doc.setFontSize(8); doc.setTextColor(180); doc.text("Generated by GetJobQuotes.uk — Sign up free to save", 105, 287, { align: "center" });
    doc.save(`demo-quote-${ref}.pdf`);
  };

  const handleAttemptDownload = () => {
    saveDemoToStorage();
    setShowWall(true);
  };

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-zinc-900 bg-black/90 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-base font-bold"><span className="text-green-400">Get</span>JobQuotes</Link>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-xs text-green-400 bg-green-500/10 border border-green-500/30 px-3 py-1 rounded-full">🎯 Free Demo</span>
          <Link href="/auth?mode=signup" className="px-4 py-2 text-sm font-bold bg-green-600 hover:bg-green-500 rounded-lg transition">Sign Up Free</Link>
        </div>
      </nav>

      {/* Banner */}
      <div className="bg-green-600/10 border-b border-green-600/20 px-4 py-3 text-center">
        <p className="text-sm text-green-300">
          👋 Try it out — <strong>no account needed</strong>.
          <Link href="/auth?mode=signup" className="ml-1 underline font-semibold hover:text-white">Sign up free</Link> to save, email and convert to invoice.
        </p>
      </div>

      {/* Sign-up wall modal */}
      {showWall && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-7 shadow-2xl">
            <div className="text-center mb-5">
              <div className="text-5xl mb-3">💾</div>
              <h2 className="text-xl font-bold text-white">Save & download your quote</h2>
              <p className="text-zinc-400 text-sm mt-2">
                Create a free account in 30 seconds. Your quote will be <strong className="text-white">automatically saved</strong> to your account.
              </p>
            </div>
            <div className="space-y-2">
              <Link href="/auth?mode=signup" onClick={saveDemoToStorage}
                className="block w-full py-3.5 text-center rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-sm transition">
                Create Free Account & Save →
              </Link>
              <Link href="/auth?mode=login" onClick={saveDemoToStorage}
                className="block w-full py-3 text-center rounded-xl border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white text-sm font-semibold transition">
                I already have an account
              </Link>
              <button onClick={() => { setShowWall(false); generatePDF(); }}
                className="block w-full py-2.5 text-center text-xs text-zinc-600 hover:text-zinc-400 transition">
                Just download without saving (you'll lose this quote)
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-xl mx-auto px-4 py-10 space-y-5">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">Try It Free</h1>
          <p className="text-zinc-400 text-sm">Fill in your quote below. Sign up to save it.</p>
        </div>

        {/* Client */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-3">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Client Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Client Name</label>
              <input value={form.clientName} onChange={(e) => set("clientName", e.target.value)} placeholder="John Smith"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Client Email</label>
              <input value={form.clientEmail} onChange={(e) => set("clientEmail", e.target.value)} type="email" placeholder="john@email.com"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition" />
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Job Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="e.g. New boiler installation..." rows={2}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition resize-none" />
          </div>
        </div>

        {/* Line items */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-3">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Line Items</h2>
          <div className="grid grid-cols-12 gap-2 text-xs text-zinc-600 px-1">
            <span className="col-span-6">Description</span><span className="col-span-2 text-center">Qty</span><span className="col-span-4 text-right">Unit (£)</span>
          </div>
          {lineItems.map((item, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <input value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)} placeholder="Labour / parts..."
                className="col-span-6 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition" />
              <input value={item.quantity} onChange={(e) => updateItem(i, "quantity", e.target.value)} type="number" min="0"
                className="col-span-2 rounded-xl border border-zinc-700 bg-zinc-950 px-2 py-2.5 text-white text-sm outline-none focus:border-green-500 transition text-center" />
              <input value={item.unitPrice} onChange={(e) => updateItem(i, "unitPrice", e.target.value)} type="number" min="0" step="0.01"
                className="col-span-3 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white text-sm outline-none focus:border-green-500 transition text-right" />
              {lineItems.length > 1 && (
                <button onClick={() => setLineItems((p) => p.filter((_, idx) => idx !== i))}
                  className="col-span-1 text-zinc-700 hover:text-red-400 text-xl leading-none transition text-center">×</button>
              )}
            </div>
          ))}
          <button onClick={() => setLineItems((p) => [...p, { description: "", quantity: 1, unitPrice: 0 }])}
            className="text-sm text-green-400 hover:text-green-300 transition">+ Add Item</button>
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => set("vat", !form.vat)} className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ${form.vat ? "bg-green-600" : "bg-zinc-700"}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.vat ? "left-5" : "left-0.5"}`} />
            </div>
            <span className="text-sm text-zinc-300">Add VAT (20%)</span>
          </label>
        </div>

        {/* Total */}
        <div className="rounded-2xl border border-green-600/30 bg-green-600/5 px-5 py-4">
          {form.vat && <div className="flex justify-between text-sm text-zinc-400 mb-1"><span>Subtotal</span><span>£{subtotal.toFixed(2)}</span></div>}
          {form.vat && <div className="flex justify-between text-sm text-zinc-400 mb-2"><span>VAT (20%)</span><span>£{vatAmount.toFixed(2)}</span></div>}
          <div className="flex justify-between text-xl font-bold text-white">
            <span>Total</span><span className="text-green-400">£{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Notes (optional)</h2>
          <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Payment terms, special conditions..." rows={2}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition resize-none" />
        </div>

        {/* Signature */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Signature (optional)</h2>
          <canvas ref={sigCanvasRef} width={600} height={110}
            className="w-full rounded-xl bg-zinc-950 border border-zinc-700 cursor-crosshair touch-none"
            style={{ touchAction: "none" }}
            onMouseDown={startDraw} onMouseMove={drawSig} onMouseUp={endDraw} onMouseLeave={endDraw}
            onTouchStart={startDraw} onTouchMove={drawSig} onTouchEnd={endDraw} />
          {hasSig && <button onClick={() => { sigCanvasRef.current?.getContext("2d")?.clearRect(0, 0, 600, 110); setHasSig(false); }} className="text-xs text-zinc-600 hover:text-red-400 transition mt-2 block">Clear</button>}
        </div>

        <button onClick={handleAttemptDownload}
          className="w-full py-4 rounded-xl bg-green-600 hover:bg-green-500 text-base font-bold text-white transition">
          Save & Download Quote →
        </button>

        <p className="text-center text-xs text-zinc-600">
          <Link href="/auth?mode=signup" className="text-green-500 hover:text-green-400">Sign up free</Link> to save, email and convert to invoice
        </p>
      </div>

      <footer className="border-t border-zinc-900 px-6 py-6 flex flex-wrap gap-4 text-xs text-zinc-700 justify-center">
        <Link href="/terms" className="hover:text-zinc-400 transition">Terms</Link>
        <Link href="/privacy" className="hover:text-zinc-400 transition">Privacy</Link>
        <Link href="/status" className="hover:text-zinc-400 transition">Status</Link>
      </footer>
    </div>
  );
}
