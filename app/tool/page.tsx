"use client";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import TopNav from "@/components/TopNav";
import jsPDF from "jspdf";

type LineItem = { description: string; quantity: number; unitPrice: number };
const fmt = (n: number) => `£${Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`;

function buildQuotePDF(opts: {
  form: any; lineItems: LineItem[]; subtotal: number; vatAmount: number; total: number;
  sigData: string; profile: any; editId: string | null;
}) {
  const { form, lineItems, subtotal, vatAmount, total, sigData, profile, editId } = opts;
  const doc = new jsPDF();
  const ref = editId ? `QUO-${editId.slice(-6).toUpperCase()}` : "QUO-" + Date.now().toString().slice(-6);
  const date = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const expiry = form.expiryDays !== "none"
    ? new Date(Date.now() + parseInt(form.expiryDays) * 86400000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : null;

  doc.setFillColor(15, 15, 15);
  doc.rect(0, 0, 210, 38, "F");
  doc.setTextColor(34, 197, 94); doc.setFontSize(22); doc.setFont("helvetica", "bold");
  doc.text(form.type === "invoice" ? "INVOICE" : "QUOTE", 14, 17);
  doc.setTextColor(180, 180, 180); doc.setFontSize(8); doc.setFont("helvetica", "normal");
  doc.text(`Ref: ${ref}`, 14, 27); doc.text(`Date: ${date}`, 14, 34);
  if (expiry) doc.text(`Valid until: ${expiry}`, 196, 34, { align: "right" });

  if (profile) {
    let bx = 196, by = 10;
    if (profile.business_name) {
      doc.setTextColor(220, 220, 220); doc.setFont("helvetica", "bold");
      doc.text(profile.business_name, bx, by, { align: "right" }); by += 6;
      doc.setFont("helvetica", "normal"); doc.setTextColor(150, 150, 150);
    }
    if (profile.business_email) { doc.text(profile.business_email, bx, by, { align: "right" }); by += 5; }
    if (profile.business_phone) { doc.text(profile.business_phone, bx, by, { align: "right" }); by += 5; }
  }

  if (profile?.logo_url) {
    try { doc.addImage(profile.logo_url, "PNG", 14, 42, 28, 14); } catch {}
  }

  const billY = profile?.logo_url ? 62 : 48;
  doc.setTextColor(100, 100, 100); doc.setFontSize(8); doc.setFont("helvetica", "bold");
  doc.text("BILL TO", 14, billY);
  doc.setTextColor(30, 30, 30); doc.setFont("helvetica", "normal"); doc.setFontSize(9);
  doc.text(form.clientName || "—", 14, billY + 7);
  if (form.clientEmail) doc.text(form.clientEmail, 14, billY + 13);
  if (form.clientPhone) doc.text(form.clientPhone, 14, billY + 19);
  if (form.description) {
    doc.setTextColor(80, 80, 80); doc.setFontSize(8);
    doc.text(doc.splitTextToSize(`Job: ${form.description}`, 182), 14, billY + 26);
  }

  let tableY = billY + 38;
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

  if (form.notes) {
    doc.setTextColor(80, 80, 80); doc.setFont("helvetica", "bold"); doc.setFontSize(8);
    doc.text("NOTES", 14, rowY); doc.setFont("helvetica", "normal"); doc.setTextColor(60, 60, 60);
    const nLines = doc.splitTextToSize(form.notes, 182);
    doc.text(nLines, 14, rowY + 7); rowY += nLines.length * 5 + 12;
  }

  if (sigData) {
    doc.setTextColor(100, 100, 100); doc.setFont("helvetica", "bold"); doc.setFontSize(8);
    doc.text("AUTHORISED SIGNATURE", 14, rowY);
    try { doc.addImage(sigData, "PNG", 14, rowY + 3, 65, 22); } catch {}
  }

  doc.setFontSize(7); doc.setTextColor(180, 180, 180); doc.setFont("helvetica", "normal");
  doc.text("Generated by GetJobQuotes.uk", 105, 287, { align: "center" });
  return doc;
}

function ToolInner() {
  const supabase = createClient();
  const router = useRouter();
  const params = useSearchParams();
  const editId = params.get("id");
  const sigRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);
    const debounce = useRef<NodeJS.Timeout | null>(null);

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasSig, setHasSig] = useState(false);
  const [sigData, setSigData] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsError, setShowTermsError] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const [form, setForm] = useState({
    clientName: "", clientEmail: "", clientPhone: "", description: "",
    vat: false, notes: "", expiryDays: "30", type: "quote" as "quote" | "invoice",
  });
  const [lineItems, setLineItems] = useState<LineItem[]>([{ description: "", quantity: 1, unitPrice: 0 }]);

  const subtotal = lineItems.reduce((s, i) => s + Number(i.quantity) * Number(i.unitPrice), 0);
  const vatAmount = form.vat ? subtotal * 0.2 : 0;
  const total = subtotal + vatAmount;

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      setUser(user);
      const [{ data: prof }, { data: custs }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("customers").select("*").eq("user_id", user.id).order("name"),
      ]);
      if (prof) { setProfile(prof); if (prof.signature_data) { setSigData(prof.signature_data); setHasSig(true); } }
      setCustomers(custs || []);
      if (editId) {
        const { data: doc } = await supabase.from("documents").select("*").eq("id", editId).single();
        if (doc) {
          setForm({ clientName: doc.client_name || "", clientEmail: doc.client_email || "",
            clientPhone: "", description: doc.description || "", vat: doc.vat || false,
            notes: doc.notes || "", expiryDays: "30", type: doc.type || "quote" });
          if (doc.line_items?.length) setLineItems(doc.line_items);
          if (doc.signature_data) { setSigData(doc.signature_data); setHasSig(true); }
        }
      } else {
        try {
          const raw = localStorage.getItem("gjq_draft_quote");
          if (raw) {
            const d = JSON.parse(raw);
            const age = (Date.now() - new Date(d.savedAt).getTime()) / 3600000;
            if (age < 24 && d.form?.clientName && window.confirm(`Restore draft for "${d.form.clientName}"?`)) {
              setForm(d.form); setLineItems(d.lineItems || [{ description: "", quantity: 1, unitPrice: 0 }]);
              if (d.sigData) { setSigData(d.sigData); setHasSig(true); }
            } else localStorage.removeItem("gjq_draft_quote");
          }
        } catch {}
      }
    })();
  }, []);

  useEffect(() => {
    if (!user || editId) return;
    const t = setInterval(() => {
      localStorage.setItem("gjq_draft_quote", JSON.stringify({ form, lineItems, sigData, savedAt: new Date().toISOString() }));
    }, 30000);
    return () => clearInterval(t);
  }, [user, form, lineItems, sigData]);

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
    lastPos.current = pos; setHasSig(true); setSigData(sigRef.current.toDataURL("image/png"));
  };
  const endDraw = (e: any) => { e.preventDefault(); isDrawing.current = false; lastPos.current = null; };

  const buildPDF = useCallback(() =>
    buildQuotePDF({ form, lineItems, subtotal, vatAmount, total, sigData, profile, editId }),
    [form, lineItems, subtotal, vatAmount, total, sigData, profile, editId]);

  // Live preview — data URI, works in all browsers
  useEffect(() => {
    if (!showPreview) return;
    const timer = setTimeout(() => {
      try {
        const uri = buildPDF().output("datauristring");
        if (previewRef.current) {
          previewRef.current.src = uri;
        }
      } catch (e) {
        console.error("PDF preview error:", e);
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [form, lineItems, sigData, showPreview]);


}
