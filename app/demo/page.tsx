"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import jsPDF from "jspdf";

type LineItem = { description: string; quantity: number; unitPrice: number };

export default function DemoPage() {
  const [form, setForm] = useState({ clientName: "", description: "", vat: false, notes: "" });
  const [lineItems, setLineItems] = useState<LineItem[]>([{ description: "", quantity: 1, unitPrice: 0 }]);
  const [downloaded, setDownloaded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const sigRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);
  const blobUrl = useRef<string | null>(null);
  const debounce = useRef<NodeJS.Timeout | null>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [hasSig, setHasSig] = useState(false);

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));
  const updateItem = (i: number, k: keyof LineItem, v: any) =>
    setLineItems(p => p.map((item, idx) => idx === i ? { ...item, [k]: v } : item));

  const subtotal = lineItems.reduce((s, i) => s + Number(i.quantity) * Number(i.unitPrice), 0);
  const vatAmount = form.vat ? subtotal * 0.2 : 0;
  const total = subtotal + vatAmount;
  const fmt = (n: number) => `£${n.toFixed(2)}`;

  const getPos = (e: any, c: HTMLCanvasElement) => {
    const r = c.getBoundingClientRect();
    if (e.touches) return { x: (e.touches[0].clientX - r.left) * (c.width / r.width), y: (e.touches[0].clientY - r.top) * (c.height / r.height) };
    return { x: (e.clientX - r.left) * (c.width / r.width), y: (e.clientY - r.top) * (c.height / r.height) };
  };
  const startDraw = (e: any) => { e.preventDefault(); isDrawing.current = true; lastPos.current = getPos(e, sigRef.current!); };
  const drawSig = (e: any) => {
    e.preventDefault();
    if (!isDrawing.current || !lastPos.current || !sigRef.current) return;
    const ctx = sigRef.current.getContext("2d")!;
    const pos = getPos(e, sigRef.current);
    ctx.beginPath(); ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y); ctx.strokeStyle = "#22c55e"; ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.stroke();
    lastPos.current = pos; setHasSig(true);
  };
  const endDraw = (e: any) => { e.preventDefault(); isDrawing.current = false; lastPos.current = null; };

  const buildPDF = useCallback(() => {
    const doc = new jsPDF();
    const ref = "DEMO-" + Date.now().toString().slice(-6);
    const date = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

    doc.setFillColor(15, 15, 15); doc.rect(0, 0, 210, 38, "F");
    doc.setTextColor(34, 197, 94); doc.setFontSize(22); doc.setFont("helvetica", "bold");
    doc.text("QUOTE", 14, 17);
    doc.setTextColor(180, 180, 180); doc.setFontSize(8); doc.setFont("helvetica", "normal");
    doc.text(`Ref: ${ref}`, 14, 27); doc.text(`Date: ${date}`, 14, 34);
    doc.setTextColor(120, 120, 120); doc.text("Demo — Sign up to save", 196, 10, { align: "right" });

    doc.setTextColor(100, 100, 100); doc.setFontSize(8); doc.setFont("helvetica", "bold");
    doc.text("BILL TO", 14, 50);
    doc.setTextColor(30, 30, 30); doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    doc.text(form.clientName || "Client Name", 14, 58);
    if (form.description) {
      doc.setTextColor(80, 80, 80); doc.setFontSize(8);
      doc.text(doc.splitTextToSize(`Job: ${form.description}`, 182), 14, 66);
    }

    let tableY = 78;
    doc.setFillColor(240, 240, 240); doc.rect(14, tableY, 182, 8, "F");
    doc.setTextColor(60, 60, 60); doc.setFont("helvetica", "bold"); doc.setFontSize(8);
    doc.text("Description", 16, tableY + 5.5);
    doc.text("Qty", 135, tableY + 5.5, { align: "right" });
    doc.text("Unit price", 162, tableY + 5.5, { align: "right" });
    doc.text("Total", 194, tableY + 5.5, { align: "right" });

    let rowY = tableY + 13;
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
    lineItems.forEach((item, i) => {
      if (!item.description && !item.unitPrice) return;
      if (i % 2 === 1) { doc.setFillColor(250, 250, 250); doc.rect(14, rowY - 5.5, 182, 9, "F"); }
      doc.setTextColor(20, 20, 20);
      const lines = doc.splitTextToSize(item.description || "—", 110);
      doc.text(lines, 16, rowY);
      doc.text(String(item.quantity), 135, rowY, { align: "right" });
      doc.text(`£${Number(item.unitPrice).toFixed(2)}`, 162, rowY, { align: "right" });
      doc.text(`£${(Number(item.quantity) * Number(item.unitPrice)).toFixed(2)}`, 194, rowY, { align: "right" });
      rowY += lines.length > 1 ? lines.length * 5 + 4 : 9;
    });

    rowY += 6;
    doc.setDrawColor(220, 220, 220); doc.line(120, rowY - 3, 194, rowY - 3);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(80, 80, 80);
    doc.text("Subtotal", 120, rowY); doc.text(`£${subtotal.toFixed(2)}`, 194, rowY, { align: "right" }); rowY += 7;
    if (form.vat) {
      doc.text("VAT (20%)", 120, rowY); doc.text(`£${vatAmount.toFixed(2)}`, 194, rowY, { align: "right" }); rowY += 7;
    }
    doc.setFillColor(22, 163, 74); doc.rect(14, rowY, 182, 12, "F");
    doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(10);
    doc.text("TOTAL", 16, rowY + 8); doc.text(`£${total.toFixed(2)}`, 194, rowY + 8, { align: "right" });
    rowY += 19;

    if (hasSig && sigRef.current) {
      doc.setTextColor(100, 100, 100); doc.setFont("helvetica", "bold"); doc.setFontSize(8);
      doc.text("SIGNATURE", 14, rowY);
      try { doc.addImage(sigRef.current.toDataURL("image/png"), "PNG", 14, rowY + 3, 65, 22); } catch {}
      rowY += 30;
    }

    if (form.notes) {
      doc.setTextColor(80, 80, 80); doc.setFont("helvetica", "bold"); doc.setFontSize(8);
      doc.text("NOTES", 14, rowY); doc.setFont("helvetica", "normal"); doc.setTextColor(60, 60, 60);
      doc.text(doc.splitTextToSize(form.notes, 182), 14, rowY + 7);
    }

    doc.setFontSize(7); doc.setTextColor(180, 180, 180);
    doc.text("Generated by GetJobQuotes.uk — Sign up free to save & send quotes", 105, 287, { align: "center" });
    return doc;
  }, [form, lineItems, subtotal, vatAmount, total, hasSig]);

  // Live preview
  useEffect(() => {
    if (!showPreview) return;
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      setPreviewLoading(true);
      try {
        const blob = buildPDF().output("blob");
        if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
        blobUrl.current = URL.createObjectURL(blob);
        if (previewRef.current) previewRef.current.src = blobUrl.current;
      } catch {}
      setPreviewLoading(false);
    }, 600);
    return () => { if (debounce.current) clearTimeout(debounce.current); };
  }, [form, lineItems, hasSig, showPreview, buildPDF]);

  const handleDownload = () => {
    try {
      // Validate before showing signup wall
      if (!form.clientName && lineItems.every(i => !i.description && !i.unitPrice)) {
        setPdfError("Please add a client name or at least one line item first.");
        return;
      }
      setPdfError("");
    } catch {}
    setShowSignup(true); // Show signup wall BEFORE download
  };

  const doDownload = () => {
    try {
      buildPDF().save(`demo-quote-${form.clientName || "quote"}.pdf`);
    } catch (e) {
      console.error("PDF download error:", e);
      setPdfError("PDF generation failed. Please try again.");
      return;
    }
    setDownloaded(true);
    setShowSignup(false);
    // Save to localStorage for import after signup
    try {
      localStorage.setItem("gjq_demo_import", JSON.stringify({ form, lineItems, total }));
    } catch {}));
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-base font-bold"><span className="text-green-400">Get</span>JobQuotes</Link>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-green-500/10 border border-green-500/30 text-green-400 px-3 py-1 rounded-full">🎯 Free Demo</span>
          <Link href="/auth?mode=signup" className="px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-500 rounded-lg transition">Sign Up Free</Link>
        </div>
      </nav>

      <div className="bg-green-600/10 border-b border-green-600/20 px-6 py-2.5 text-center">
        <p className="text-sm text-green-300">
          👋 Demo mode — <strong>no account needed</strong>. Build a real quote and see the PDF live.{" "}
          <Link href="/auth?mode=signup" className="underline hover:text-white">Sign up free</Link> to save & send.
        </p>
      </div>

      {/* Split layout */}
      <div className="flex h-[calc(100vh-108px)]">
        {/* Form */}
        <div className="w-full lg:w-[480px] shrink-0 overflow-y-auto border-r border-zinc-900">
          <div className="px-5 py-5 space-y-4">
            <div>
              <h1 className="text-xl font-bold mb-0.5">Try it free</h1>
              <p className="text-zinc-500 text-xs">Build a real quote — download the PDF. No account needed.</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Client</p>
              <div>
                <label className="text-xs text-zinc-600 mb-1 block">Client Name</label>
                <input value={form.clientName} onChange={e => set("clientName", e.target.value)} placeholder="e.g. John Smith"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition" />
              </div>
              <div>
                <label className="text-xs text-zinc-600 mb-1 block">Job Description</label>
                <input value={form.description} onChange={e => set("description", e.target.value)} placeholder="e.g. Boiler installation"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition" />
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Line Items</p>
              <div className="grid grid-cols-12 gap-1 text-xs text-zinc-600 px-1">
                <span className="col-span-6">Description</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-4 text-right">Unit £</span>
              </div>
              {lineItems.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-1 items-center">
                  <input value={item.description} onChange={e => updateItem(i, "description", e.target.value)} placeholder="Labour / parts"
                    className="col-span-6 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-white text-xs placeholder:text-zinc-600 outline-none focus:border-green-500 transition" />
                  <input value={item.quantity} onChange={e => updateItem(i, "quantity", e.target.value)} type="number" min="0"
                    className="col-span-2 rounded-lg border border-zinc-700 bg-zinc-950 px-1 py-2 text-white text-xs outline-none focus:border-green-500 transition text-center" />
                  <input value={item.unitPrice} onChange={e => updateItem(i, "unitPrice", e.target.value)} type="number" min="0" step="0.01"
                    className="col-span-3 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-white text-xs outline-none focus:border-green-500 transition text-right" />
                  {lineItems.length > 1 && (
                    <button onClick={() => setLineItems(p => p.filter((_, idx) => idx !== i))} className="col-span-1 text-zinc-700 hover:text-red-400 text-lg transition text-center">×</button>
                  )}
                </div>
              ))}
              <button onClick={() => setLineItems(p => [...p, { description: "", quantity: 1, unitPrice: 0 }])}
                className="text-xs text-green-400 hover:text-green-300 transition">+ Add item</button>
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <div onClick={() => set("vat", !form.vat)}
                  className={`w-9 h-5 rounded-full relative transition-colors shrink-0 ${form.vat ? "bg-green-600" : "bg-zinc-700"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.vat ? "left-4" : "left-0.5"}`} />
                </div>
                <span className="text-xs text-zinc-400">Include VAT (20%)</span>
              </label>
            </div>

            <div className="rounded-xl border border-green-600/20 bg-green-600/5 px-4 py-3">
              {form.vat && <div className="flex justify-between text-xs text-zinc-500 mb-1"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>}
              {form.vat && <div className="flex justify-between text-xs text-zinc-500 mb-2"><span>VAT (20%)</span><span>{fmt(vatAmount)}</span></div>}
              <div className="flex justify-between text-base font-bold"><span>Total</span><span className="text-green-400">{fmt(total)}</span></div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">Signature (Optional)</p>
              <canvas ref={sigRef} width={600} height={100}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-700 cursor-crosshair touch-none"
                style={{ touchAction: "none" }}
                onMouseDown={startDraw} onMouseMove={drawSig} onMouseUp={endDraw} onMouseLeave={endDraw}
                onTouchStart={startDraw} onTouchMove={drawSig} onTouchEnd={endDraw} />
              {hasSig && <button onClick={() => { sigRef.current?.getContext("2d")?.clearRect(0,0,600,100); setHasSig(false); }} className="text-xs text-zinc-600 hover:text-red-400 transition mt-1">Clear</button>}
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
              <label className="text-xs text-zinc-600 mb-1 block">Notes (Optional)</label>
              <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2}
                placeholder="Payment terms, guarantees..."
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition resize-none" />
            </div>

            {pdfError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-400">
                {pdfError}
              </div>
            )}
            <button onClick={handleDownload}
              className="w-full py-4 rounded-xl bg-green-600 hover:bg-green-500 text-base font-bold text-white transition">
              ↓ Download PDF Quote
            </button>

            {downloaded && (
              <div className="rounded-2xl border border-green-600/30 bg-green-600/5 p-5 text-center">
                <p className="text-green-400 font-semibold mb-1">✅ Quote downloaded!</p>
                <p className="text-zinc-400 text-sm mb-4">Sign up free to save quotes, convert to invoices, send by email and more.</p>
                <Link href="/auth?mode=signup" className="inline-block px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-sm transition">Create Free Account →</Link>
              </div>
            )}
          </div>
        </div>

        {/* Desktop live preview */}
        <div className="hidden lg:flex flex-col flex-1 bg-zinc-950">
          <div className="border-b border-zinc-900 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${previewLoading ? "bg-yellow-400 animate-pulse" : "bg-green-400"}`} />
              <span className="text-xs text-zinc-500">{previewLoading ? "Updating..." : "Live PDF preview"}</span>
            </div>
            <button onClick={() => setShowPreview(v => !v)} className="text-xs text-zinc-600 hover:text-zinc-400 transition">
              {showPreview ? "Hide" : "Show preview"}
            </button>
          </div>
          {showPreview ? (
            <div className="flex-1 relative">
              <iframe ref={previewRef} className="w-full h-full border-0" title="PDF Preview" />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-700 gap-3">
              <span className="text-4xl">📄</span>
              <p className="text-sm">See your PDF update in real-time as you type</p>
              <button onClick={() => setShowPreview(true)} className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm transition">Show Live Preview</button>
            </div>
          )}
        </div>

        {/* Mobile preview FAB */}
        <button onClick={() => setShowPreview(v => !v)}
          className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-green-600 hover:bg-green-500 shadow-2xl flex items-center justify-center text-2xl transition">
          📄
        </button>
      </div>

      {/* Mobile preview modal */}
      {showPreview && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/95 flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-900">
            <span className="text-sm font-semibold">Live PDF Preview</span>
            <button onClick={() => setShowPreview(false)} className="text-zinc-400 hover:text-white text-2xl leading-none">×</button>
          </div>
          <iframe ref={previewRef} className="flex-1 w-full border-0" title="PDF Preview Mobile" />
        </div>
      )}

      {/* Signup wall modal */}
      {showSignup && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="text-3xl mb-3 text-center">🎉</div>
            <h2 className="text-xl font-bold text-center mb-1">Your quote is ready!</h2>
            <p className="text-zinc-400 text-sm text-center mb-5">
              Create a free account to download, save, and send this quote to your client. Takes 30 seconds.
            </p>
            <Link href="/auth?mode=signup" onClick={() => localStorage.setItem("gjq_demo_import", JSON.stringify({ form, lineItems, total }))}
              className="block w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-sm text-center transition mb-2">
              Sign Up Free & Download →
            </Link>
            <button onClick={doDownload}
              className="block w-full py-3 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white text-sm text-center transition">
              No thanks, just download
            </button>
            <button onClick={() => setShowSignup(false)} className="w-full text-center text-xs text-zinc-600 hover:text-zinc-400 mt-3 transition">← Back to editing</button>
          </div>
        </div>
      )}

      <footer className="border-t border-zinc-900 px-6 py-4 flex flex-wrap gap-4 text-xs text-zinc-700 justify-center">
        <Link href="/terms" className="hover:text-zinc-400 transition">Terms</Link>
        <Link href="/privacy" className="hover:text-zinc-400 transition">Privacy</Link>
        <Link href="/auth?mode=signup" className="hover:text-zinc-400 transition">Sign Up Free</Link>
      </footer>
    </div>
  );
}
