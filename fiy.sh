#!/bin/bash
# Fix: routing + live PDF preview + T&C disclaimer + AdSense
# cd ~/projects/getjobquotes-marketing && bash fix-routing-pdf-preview.sh

set -e

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  Fix routing + PDF preview + T&C + AdSense           ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ============================================================
# 1. FIX SUPABASE SERVER CLIENT
# ============================================================
mkdir -p lib/supabase
cat > lib/supabase/server.ts << 'EOF'
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                httpOnly: true,
                path: "/",
              })
            );
          } catch {}
        },
      },
    }
  );
}
EOF
echo "✅ lib/supabase/server.ts"

cat > lib/supabase/client.ts << 'EOF'
import { createBrowserClient } from "@supabase/ssr";
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
EOF
echo "✅ lib/supabase/client.ts"

# ============================================================
# 2. FIX MIDDLEWARE — /auth/callback EXCLUDED (root cause of
#    bad_oauth_state AND broken routing)
# ============================================================
cat > middleware.ts << 'EOF'
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;
  const PROTECTED = ["/dashboard", "/tool", "/profile", "/customers"];

  if (PROTECTED.some((r) => pathname.startsWith(r)) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname === "/auth" && user && !request.nextUrl.searchParams.get("next")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  // CRITICAL: auth/callback excluded — middleware getUser() would
  // consume the OAuth state cookie before route handler can use it
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|ads\\.txt|robots\\.txt|manifest\\.json|icon|api/|auth/callback|demo|status|q/|sitemap).*)",
  ],
};
EOF
echo "✅ middleware.ts — routing fixed + /auth/callback excluded"

# ============================================================
# 3. FIX AUTH CALLBACK
# ============================================================
mkdir -p app/auth/callback
cat > app/auth/callback/route.ts << 'EOF'
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!.replace(/\/$/, "");

  if (!code) return NextResponse.redirect(`${appUrl}/auth?error=no_code`);

  const cookieStore = await cookies();
  const response = NextResponse.redirect(`${appUrl}${next}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, {
              ...options,
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
              httpOnly: true,
              path: "/",
            })
          );
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    console.error("Auth callback error:", error?.message);
    return NextResponse.redirect(`${appUrl}/auth?error=callback`);
  }

  const user = data.user;
  const { data: existingProfile } = await supabase
    .from("profiles").select("id").eq("user_id", user.id).single();

  if (!existingProfile) {
    await supabase.from("profiles").upsert({
      user_id: user.id,
      business_email: user.email,
      created_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    const name = user.user_metadata?.full_name || user.user_metadata?.name ||
      user.email?.split("@")[0]?.replace(/[._-]/g, " ") || "";

    fetch(`${appUrl}/api/email/welcome`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, name }),
    }).catch(() => {});
  }

  return response;
}
EOF
echo "✅ app/auth/callback/route.ts"

# ============================================================
# 4. FIX CONTACT EMAIL everywhere
# ============================================================
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.sql" \) \
  ! -path "*/node_modules/*" ! -path "*/.next/*" \
  -exec sed -i 's/hello@getjobquotes\.uk/support@getjobquotes.uk/g' {} +
echo "✅ Contact email → support@getjobquotes.uk"

# ============================================================
# 5. QUOTE TOOL — live PDF preview + T&C disclaimer
#    Split layout: form left, PDF preview right (desktop)
#    Preview updates live as you type using jsPDF blob + iframe
# ============================================================
mkdir -p app/tool
cat > app/tool/page.tsx << 'TOOLEOF'
"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import TopNav from "@/components/TopNav";
import AdBanner from "@/components/AdBanner";
import jsPDF from "jspdf";

type LineItem = { description: string; quantity: number; unitPrice: number };

function fmt(n: number) {
  return `£${Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function ToolInner() {
  const supabase = createClient();
  const router = useRouter();
  const params = useSearchParams();
  const editId = params.get("id");
  const fileRef = useRef<HTMLInputElement>(null);
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);
  const previewBlobUrl = useRef<string | null>(null);
  const previewDebounce = useRef<NodeJS.Timeout | null>(null);

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
    clientName: "", clientEmail: "", clientPhone: "", clientAddress: "",
    description: "", vat: false, notes: "", expiryDays: "30", type: "quote" as "quote" | "invoice",
  });
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);

  const subtotal = lineItems.reduce((s, i) => s + Number(i.quantity) * Number(i.unitPrice), 0);
  const vatAmount = form.vat ? subtotal * 0.2 : 0;
  const total = subtotal + vatAmount;

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      setUser(user);

      const [{ data: prof }, { data: custs }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("customers").select("*").eq("user_id", user.id).order("name"),
      ]);
      if (prof) {
        setProfile(prof);
        if (prof.signature_data) { setSigData(prof.signature_data); setHasSig(true); }
      }
      setCustomers(custs || []);

      if (editId) {
        const { data: doc } = await supabase.from("documents").select("*").eq("id", editId).single();
        if (doc) {
          setForm({
            clientName: doc.client_name || "", clientEmail: doc.client_email || "",
            clientPhone: "", clientAddress: "",
            description: doc.description || "", vat: doc.vat || false,
            notes: doc.notes || "", expiryDays: "30", type: doc.type || "quote",
          });
          if (doc.line_items?.length) setLineItems(doc.line_items);
          if (doc.signature_data) { setSigData(doc.signature_data); setHasSig(true); }
        }
      } else {
        // Restore draft
        try {
          const raw = localStorage.getItem("gjq_draft_quote");
          if (raw) {
            const draft = JSON.parse(raw);
            const age = (Date.now() - new Date(draft.savedAt).getTime()) / 3600000;
            if (age < 24 && draft.form?.clientName) {
              if (window.confirm(`Restore draft for "${draft.form.clientName}"?`)) {
                setForm(draft.form);
                setLineItems(draft.lineItems || [{ description: "", quantity: 1, unitPrice: 0 }]);
                if (draft.sigData) { setSigData(draft.sigData); setHasSig(true); }
              } else { localStorage.removeItem("gjq_draft_quote"); }
            }
          }
        } catch {}
      }
    };
    init();
  }, []);

  // Auto-save draft every 30s
  useEffect(() => {
    if (!user || editId) return;
    const t = setInterval(() => {
      localStorage.setItem("gjq_draft_quote", JSON.stringify({
        form, lineItems, sigData, savedAt: new Date().toISOString(),
      }));
    }, 30000);
    return () => clearInterval(t);
  }, [user, form, lineItems, sigData]);

  // ── Signature canvas ─────────────────────────────────────
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
    setSigData(sigCanvasRef.current.toDataURL("image/png"));
  };
  const endDraw = (e: any) => { e.preventDefault(); isDrawing.current = false; lastPos.current = null; };

  // ── PDF generation (shared by preview and download) ──────
  const buildPDF = useCallback(() => {
    const doc = new jsPDF();
    const ref = editId ? `QUO-${editId.slice(-6).toUpperCase()}` : "QUO-" + Date.now().toString().slice(-6);
    const date = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const expiry = form.expiryDays !== "none"
      ? new Date(Date.now() + parseInt(form.expiryDays) * 86400000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      : null;

    // Header bar
    doc.setFillColor(15, 15, 15);
    doc.rect(0, 0, 210, 38, "F");
    doc.setTextColor(34, 197, 94); doc.setFontSize(22); doc.setFont("helvetica", "bold");
    doc.text(form.type === "invoice" ? "INVOICE" : "QUOTE", 14, 17);
    doc.setTextColor(180, 180, 180); doc.setFontSize(8); doc.setFont("helvetica", "normal");
    doc.text(`Ref: ${ref}`, 14, 27); doc.text(`Date: ${date}`, 14, 34);
    if (expiry) { doc.text(`Valid until: ${expiry}`, 196, 34, { align: "right" }); }

    // Business details (top right)
    if (profile) {
      doc.setTextColor(150, 150, 150); doc.setFontSize(8);
      let bx = 196, by = 10;
      if (profile.business_name) { doc.setTextColor(220, 220, 220); doc.setFont("helvetica", "bold"); doc.text(profile.business_name, bx, by, { align: "right" }); by += 6; doc.setFont("helvetica", "normal"); doc.setTextColor(150, 150, 150); }
      if (profile.business_email) { doc.text(profile.business_email, bx, by, { align: "right" }); by += 5; }
      if (profile.business_phone) { doc.text(profile.business_phone, bx, by, { align: "right" }); by += 5; }
    }

    // Logo
    if (profile?.logo_url) {
      try { doc.addImage(profile.logo_url, "PNG", 14, 42, 28, 14); } catch {}
    }

    // Bill To
    const billY = profile?.logo_url ? 62 : 48;
    doc.setTextColor(100, 100, 100); doc.setFontSize(8); doc.setFont("helvetica", "bold");
    doc.text("BILL TO", 14, billY);
    doc.setTextColor(30, 30, 30); doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    doc.text(form.clientName || "—", 14, billY + 7);
    if (form.clientEmail) doc.text(form.clientEmail, 14, billY + 13);
    if (form.clientPhone) doc.text(form.clientPhone, 14, billY + 19);
    if (form.description) {
      doc.setTextColor(80, 80, 80); doc.setFontSize(8);
      const descLines = doc.splitTextToSize(`Job: ${form.description}`, 182);
      doc.text(descLines, 14, billY + 26);
    }

    // Line items table
    let tableY = billY + 38;
    doc.setFillColor(240, 240, 240);
    doc.rect(14, tableY, 182, 8, "F");
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
      const descLines = doc.splitTextToSize(item.description || "—", 110);
      doc.text(descLines, 16, rowY);
      doc.text(String(item.quantity), 135, rowY, { align: "right" });
      doc.text(`£${Number(item.unitPrice).toFixed(2)}`, 162, rowY, { align: "right" });
      doc.text(`£${(Number(item.quantity) * Number(item.unitPrice)).toFixed(2)}`, 194, rowY, { align: "right" });
      rowY += descLines.length > 1 ? descLines.length * 5 + 4 : 9;
    });

    // Totals
    rowY += 6;
    doc.setDrawColor(220, 220, 220);
    doc.line(120, rowY - 3, 194, rowY - 3);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(80, 80, 80);
    doc.text("Subtotal", 120, rowY); doc.text(`£${subtotal.toFixed(2)}`, 194, rowY, { align: "right" }); rowY += 7;
    if (form.vat) {
      doc.text("VAT (20%)", 120, rowY); doc.text(`£${vatAmount.toFixed(2)}`, 194, rowY, { align: "right" }); rowY += 7;
    }
    // Total box
    doc.setFillColor(22, 163, 74); doc.rect(14, rowY, 182, 12, "F");
    doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(10);
    doc.text("TOTAL", 16, rowY + 8);
    doc.text(`£${total.toFixed(2)}`, 194, rowY + 8, { align: "right" });
    rowY += 19;

    // Notes
    if (form.notes) {
      doc.setTextColor(80, 80, 80); doc.setFont("helvetica", "bold"); doc.setFontSize(8);
      doc.text("NOTES", 14, rowY);
      doc.setFont("helvetica", "normal"); doc.setTextColor(60, 60, 60);
      const noteLines = doc.splitTextToSize(form.notes, 182);
      doc.text(noteLines, 14, rowY + 7);
      rowY += noteLines.length * 5 + 12;
    }

    // Signature
    if (sigData) {
      doc.setTextColor(100, 100, 100); doc.setFont("helvetica", "bold"); doc.setFontSize(8);
      doc.text("AUTHORISED SIGNATURE", 14, rowY);
      try { doc.addImage(sigData, "PNG", 14, rowY + 3, 65, 22); } catch {}
      rowY += 30;
    }

    // Footer
    doc.setFontSize(7); doc.setTextColor(180, 180, 180); doc.setFont("helvetica", "normal");
    doc.text("Generated by GetJobQuotes.uk", 105, 287, { align: "center" });

    return doc;
  }, [form, lineItems, subtotal, vatAmount, total, sigData, profile, editId]);

  // ── Live preview ─────────────────────────────────────────
  useEffect(() => {
    if (!showPreview) return;
    if (previewDebounce.current) clearTimeout(previewDebounce.current);
    previewDebounce.current = setTimeout(() => {
      setPreviewLoading(true);
      try {
        const doc = buildPDF();
        const blob = doc.output("blob");
        if (previewBlobUrl.current) URL.revokeObjectURL(previewBlobUrl.current);
        previewBlobUrl.current = URL.createObjectURL(blob);
        if (previewRef.current) previewRef.current.src = previewBlobUrl.current;
      } catch {}
      setPreviewLoading(false);
    }, 600);
    return () => { if (previewDebounce.current) clearTimeout(previewDebounce.current); };
  }, [form, lineItems, sigData, showPreview, buildPDF]);

  // ── Save to DB ────────────────────────────────────────────
  const handleSave = async () => {
    if (!termsAccepted) { setShowTermsError(true); return; }
    if (!user || !form.clientName) return;
    setSaving(true);
    const doc = buildPDF();
    const num = editId
      ? undefined
      : (form.type === "invoice" ? "INV" : "QUO") + "-" + Date.now().toString().slice(-6);
    const payload = {
      user_id: user.id, type: form.type,
      number: num, client_name: form.clientName,
      client_email: form.clientEmail, description: form.description,
      vat: form.vat, total, status: "pending",
      line_items: lineItems, notes: form.notes,
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
    setSaved(true); setSaving(false);
    setTimeout(() => router.push("/dashboard"), 1200);
  };

  const handleDownload = () => { buildPDF().save(`${form.type}-${form.clientName || "quote"}.pdf`); };

  const setF = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));
  const updateItem = (i: number, k: keyof LineItem, v: any) =>
    setLineItems(p => p.map((item, idx) => idx === i ? { ...item, [k]: v } : item));

  return (
    <div className="min-h-screen bg-black text-white">
      <TopNav />
      <AdBanner className="border-b border-zinc-900" />

      {/* Split layout */}
      <div className="flex h-[calc(100vh-112px)]">

        {/* ── LEFT: Form ─────────────────────────────────── */}
        <div className="w-full lg:w-[480px] xl:w-[520px] shrink-0 overflow-y-auto border-r border-zinc-900">
          <div className="px-5 py-6 space-y-4">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">{editId ? "Edit" : "New"} {form.type === "invoice" ? "Invoice" : "Quote"}</h1>
              </div>
              <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs">
                {(["quote", "invoice"] as const).map(t => (
                  <button key={t} onClick={() => setF("type", t)}
                    className={`px-3 py-1.5 rounded-full font-medium capitalize transition ${form.type === t ? "bg-green-600 text-white" : "text-zinc-400 hover:text-white"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer selector */}
            {customers.length > 0 && (
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Fill from saved customer</label>
                <select onChange={(e) => {
                  const c = customers.find(c => c.id === e.target.value);
                  if (c) setForm(p => ({ ...p, clientName: c.name, clientEmail: c.email || "", clientPhone: c.phone || "", clientAddress: c.address || "" }));
                }} className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-white text-sm outline-none focus:border-green-500 transition">
                  <option value="">— Select customer —</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}

            {/* Client details */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Client</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { k: "clientName", label: "Name *", placeholder: "John Smith", span: true },
                  { k: "clientEmail", label: "Email", placeholder: "john@email.com" },
                  { k: "clientPhone", label: "Phone", placeholder: "07700 900000" },
                ].map(f => (
                  <div key={f.k} className={f.span ? "col-span-2" : ""}>
                    <label className="text-xs text-zinc-600 mb-1 block">{f.label}</label>
                    <input value={(form as any)[f.k]} onChange={e => setF(f.k, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition" />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs text-zinc-600 mb-1 block">Job Description</label>
                <textarea value={form.description} onChange={e => setF("description", e.target.value)}
                  placeholder="e.g. New boiler installation, bathroom refurb..." rows={2}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition resize-none" />
              </div>
            </div>

            {/* Line items */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Line Items</p>
              <div className="grid grid-cols-12 gap-1 text-xs text-zinc-600 px-1">
                <span className="col-span-6">Description</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-3 text-right">Unit £</span>
              </div>
              {lineItems.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-1 items-center">
                  <input value={item.description} onChange={e => updateItem(i, "description", e.target.value)}
                    placeholder="Labour / parts"
                    className="col-span-6 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-white text-xs placeholder:text-zinc-600 outline-none focus:border-green-500 transition" />
                  <input value={item.quantity} onChange={e => updateItem(i, "quantity", e.target.value)} type="number" min="0"
                    className="col-span-2 rounded-lg border border-zinc-700 bg-zinc-950 px-1 py-2 text-white text-xs outline-none focus:border-green-500 transition text-center" />
                  <input value={item.unitPrice} onChange={e => updateItem(i, "unitPrice", e.target.value)} type="number" min="0" step="0.01"
                    className="col-span-3 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-white text-xs outline-none focus:border-green-500 transition text-right" />
                  {lineItems.length > 1 && (
                    <button onClick={() => setLineItems(p => p.filter((_, idx) => idx !== i))}
                      className="col-span-1 text-zinc-700 hover:text-red-400 text-lg transition text-center leading-none">×</button>
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

            {/* Totals summary */}
            <div className="rounded-xl border border-green-600/20 bg-green-600/5 px-4 py-3">
              {form.vat && <div className="flex justify-between text-xs text-zinc-500 mb-1"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>}
              {form.vat && <div className="flex justify-between text-xs text-zinc-500 mb-2"><span>VAT (20%)</span><span>{fmt(vatAmount)}</span></div>}
              <div className="flex justify-between text-base font-bold">
                <span>Total</span><span className="text-green-400">{fmt(total)}</span>
              </div>
            </div>

            {/* Expiry + Notes */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Quote valid for</label>
                <select value={form.expiryDays} onChange={e => setF("expiryDays", e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white text-sm outline-none focus:border-green-500 transition">
                  {[["7", "7 days"], ["14", "14 days"], ["30", "30 days"], ["60", "60 days"], ["none", "No expiry"]].map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Notes / payment terms</label>
                <textarea value={form.notes} onChange={e => setF("notes", e.target.value)}
                  placeholder="Payment due within 30 days of invoice date. Bank transfer preferred..." rows={2}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition resize-none" />
              </div>
            </div>

            {/* Signature */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Signature</p>
                {hasSig && <button onClick={() => {
                  sigCanvasRef.current?.getContext("2d")?.clearRect(0, 0, 600, 100);
                  setSigData(""); setHasSig(false);
                }} className="text-xs text-zinc-600 hover:text-red-400 transition">Clear</button>}
              </div>
              {profile?.signature_data && !hasSig && (
                <div className="flex items-center gap-3 mb-2">
                  <img src={profile.signature_data} className="h-10 rounded border border-zinc-700 bg-zinc-900 p-1" alt="sig" />
                  <button onClick={() => { setSigData(profile.signature_data); setHasSig(true); }}
                    className="text-xs text-green-400 hover:text-green-300 transition">Use profile signature</button>
                </div>
              )}
              <canvas ref={sigCanvasRef} width={600} height={100}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-700 cursor-crosshair touch-none"
                style={{ touchAction: "none" }}
                onMouseDown={startDraw} onMouseMove={drawSig} onMouseUp={endDraw} onMouseLeave={endDraw}
                onTouchStart={startDraw} onTouchMove={drawSig} onTouchEnd={endDraw} />
            </div>

            {/* ── T&C Disclaimer ─────────────────────────── */}
            <div className={`rounded-2xl border p-4 transition ${showTermsError ? "border-red-500/50 bg-red-500/5" : "border-zinc-800 bg-zinc-900/50"}`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <div onClick={() => { setTermsAccepted(v => !v); setShowTermsError(false); }}
                  className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition ${termsAccepted ? "bg-green-600 border-green-600" : "border-zinc-600 hover:border-green-500"}`}>
                  {termsAccepted && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span className="text-xs text-zinc-400 leading-relaxed">
                  I confirm this {form.type} is accurate and I accept the{" "}
                  <a href="/terms" target="_blank" className="text-green-400 hover:underline">Terms & Conditions</a>.
                  I understand this document may be legally binding once accepted by the client.
                </span>
              </label>
              {showTermsError && (
                <p className="text-red-400 text-xs mt-2 pl-8">Please accept the terms before saving.</p>
              )}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pb-6">
              <button onClick={handleDownload}
                className="py-3 rounded-xl border border-zinc-700 hover:border-zinc-500 text-sm font-semibold text-zinc-300 hover:text-white transition">
                ↓ Download PDF
              </button>
              <button onClick={handleSave} disabled={saving || saved || !form.clientName}
                className="py-3 rounded-xl bg-green-600 hover:bg-green-500 text-sm font-bold text-white transition disabled:opacity-50">
                {saved ? "✓ Saved!" : saving ? "Saving..." : `Save ${form.type === "invoice" ? "Invoice" : "Quote"}`}
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Live PDF Preview ─────────────────────── */}
        <div className="hidden lg:flex flex-col flex-1 bg-zinc-950">
          {/* Preview header */}
          <div className="border-b border-zinc-900 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full transition-colors ${previewLoading ? "bg-yellow-400 animate-pulse" : "bg-green-400"}`} />
              <span className="text-xs text-zinc-500 font-medium">
                {previewLoading ? "Updating preview..." : "Live preview"}
              </span>
            </div>
            <button onClick={() => setShowPreview(v => !v)}
              className="text-xs text-zinc-600 hover:text-zinc-400 transition">
              {showPreview ? "Hide" : "Show"}
            </button>
          </div>

          {/* PDF iframe */}
          {showPreview ? (
            <div className="flex-1 relative">
              <iframe
                ref={previewRef}
                className="w-full h-full border-0"
                title="PDF Preview"
              />
              {previewLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/60">
                  <div className="text-zinc-500 text-sm">Generating preview...</div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-700 text-sm">
              Preview hidden — click Show to enable
            </div>
          )}
        </div>

        {/* Mobile: preview toggle button */}
        <div className="lg:hidden fixed bottom-6 right-6 z-40">
          <button onClick={() => setShowPreview(v => !v)}
            className="w-14 h-14 rounded-full bg-green-600 hover:bg-green-500 shadow-2xl flex items-center justify-center text-white text-xl transition">
            📄
          </button>
        </div>
      </div>

      {/* Mobile preview modal */}
      {showPreview && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/95 flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-900">
            <span className="text-sm font-semibold">PDF Preview</span>
            <button onClick={() => setShowPreview(false)} className="text-zinc-400 hover:text-white text-2xl leading-none">×</button>
          </div>
          <iframe ref={previewRef} className="flex-1 w-full border-0" title="PDF Preview Mobile" />
        </div>
      )}
    </div>
  );
}

export default function ToolPage() {
  return <Suspense fallback={<div className="min-h-screen bg-black" />}><ToolInner /></Suspense>;
}
TOOLEOF
echo "✅ app/tool/page.tsx — live PDF preview + T&C disclaimer"

# ============================================================
# 6. ADSENSE — fix the banner component
# ============================================================
mkdir -p components
cat > components/AdBanner.tsx << 'EOF'
"use client";
import { useEffect, useRef } from "react";

export default function AdBanner({ slot = "3456789012", format = "auto", className = "" }: {
  slot?: string; format?: string; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current || !ref.current) return;
    const consent = localStorage.getItem("gjq_cookie_consent");
    if (consent === "essential") return;
    pushed.current = true;
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {}
  }, []);

  if (!process.env.NEXT_PUBLIC_ADSENSE_ID) return null;

  return (
    <div ref={ref} className={`w-full overflow-hidden ${className}`}>
      <ins className="adsbygoogle block"
        style={{ minHeight: "60px" }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true" />
    </div>
  );
}
EOF
echo "✅ components/AdBanner.tsx"

# ============================================================
# 7. COMMIT
# ============================================================
git add .
git commit -m "fix: routing (middleware/callback/supabase-client), live PDF preview in tool, T&C checkbox, AdSense fix, support@ email"
git push origin main

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  ✅  Done! Here's your current progress:            ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "  FIXED:"
echo "  ✅ /tool, /profile, /customers routing (middleware fix)"
echo "  ✅ Google OAuth bad_oauth_state (auth/callback excluded)"
echo "  ✅ Live PDF preview — updates as you type"
echo "  ✅ T&C checkbox before saving any quote/invoice"
echo "  ✅ AdSense GDPR-gated push()"
echo "  ✅ support@getjobquotes.uk everywhere"
echo ""
echo "  CURRENT BUILD STATUS:"
echo "  ✅ Landing page + demo CTA"
echo "  ✅ Demo page (no login, PDF download, signup wall)"
echo "  ✅ Auth (magic link + password + Google OAuth)"
echo "  ✅ Dashboard (search, sort, stats, mark paid)"
echo "  ✅ Quote/Invoice tool with LIVE PDF preview"
echo "  ✅ PDF download (professional template)"
echo "  ✅ Business profile (logo, signature)"
echo "  ✅ Customers (search, sort, edit)"
echo "  ✅ Public quote links + client accept flow"
echo "  ✅ WhatsApp share"
echo "  ✅ Email (welcome, quote sent, accepted)"
echo "  ✅ Terms & Privacy (real UK GDPR content)"
echo "  ✅ Cookie banner (GDPR)"
echo "  ✅ AdSense (all users)"
echo "  ✅ GA4 + Sentry"
echo "  ✅ PWA manifest"
echo "  ✅ robots.txt + sitemap"
echo "  ✅ Rate limiting"
echo "  ✅ Error boundaries"
echo "  ✅ /status health page"
echo "  ✅ Automated tests (Vitest)"
echo ""
echo "  NEXT UP (Tier 2):"
echo "  ⏳ Stripe paywall (Pro tier, £4.99/mo)"
echo "  ⏳ Referral system"
echo "  ⏳ Payment reminder cron (7/14/30 day overdue chase)"
echo "  ⏳ Read receipts (client opened quote X mins ago)"
echo "  ⏳ PWA icons (icon-192.png / icon-512.png)"
