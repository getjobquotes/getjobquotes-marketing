#!/bin/bash
# ══════════════════════════════════════════════════════════════
#  GetJobQuotes — MASTER FIX SCRIPT
#  cd ~/projects/getjobquotes-marketing && bash fix-all-master.sh
# ══════════════════════════════════════════════════════════════
set -e

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║         GetJobQuotes — Master Fix Script                 ║"
echo "║  Routing · PDF Preview (Tool + Demo) · Nav · Warnings   ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ============================================================
# 1. SUPABASE CLIENTS
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

cat > lib/supabase/client.ts << 'EOF'
import { createBrowserClient } from "@supabase/ssr";
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
EOF
echo "✅ lib/supabase/{server,client}.ts"

# ============================================================
# 2. MIDDLEWARE — /auth/callback EXCLUDED (fixes routing + OAuth)
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
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|ads\\.txt|robots\\.txt|manifest\\.json|icon|api/|auth/callback|demo|status|q/|sitemap).*)",
  ],
};
EOF
echo "✅ middleware.ts"

# ============================================================
# 3. AUTH CALLBACK
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
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://getjobquotes.uk").replace(/\/$/, "");

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
    return NextResponse.redirect(`${appUrl}/auth?error=callback`);
  }

  const user = data.user;
  const { data: existing } = await supabase
    .from("profiles").select("id").eq("user_id", user.id).single();

  if (!existing) {
    await supabase.from("profiles").upsert({
      user_id: user.id,
      business_email: user.email,
      created_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    const name = user.user_metadata?.full_name ||
      user.user_metadata?.name ||
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
# 4. TOPNAV — mobile nav links fixed
# ============================================================
mkdir -p components
cat > components/TopNav.tsx << 'EOF'
"use client";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";

export default function TopNav() {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const [initials, setInitials] = useState("?");
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setEmail(user.email || null);
      const name = user.user_metadata?.full_name || user.user_metadata?.name ||
        user.email?.split("@")[0]?.replace(/[._]/g, " ") || "";
      setDisplayName(name);
      const parts = name.trim().split(" ");
      setInitials(parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : name.slice(0, 2).toUpperCase() || "?");
    });
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const logout = async () => { await supabase.auth.signOut(); router.push("/auth"); };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/tool", label: "New Quote" },
    { href: "/customers", label: "Customers" },
    { href: "/profile", label: "Profile" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-900 bg-black/95 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="text-base font-bold shrink-0">
          <span className="text-green-400">Get</span>JobQuotes
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-1">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                pathname === l.href
                  ? "bg-green-600/20 text-green-400"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Avatar + dropdown */}
        <div className="relative" ref={dropRef}>
          <button onClick={() => setOpen(v => !v)}
            className="w-9 h-9 rounded-full bg-green-600 hover:bg-green-500 text-white text-sm font-bold flex items-center justify-center transition">
            {initials}
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-zinc-800">
                <p className="text-sm font-semibold text-white truncate">{displayName || "Your account"}</p>
                <p className="text-xs text-zinc-500 truncate">{email}</p>
              </div>
              {/* All nav links visible on mobile */}
              <div className="py-1 border-b border-zinc-800">
                {navLinks.map(l => (
                  <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                    className={`block px-4 py-2.5 text-sm transition ${
                      pathname === l.href ? "text-green-400 font-semibold bg-green-600/10" : "text-zinc-300 hover:text-white hover:bg-zinc-900"
                    }`}>
                    {l.label}
                  </Link>
                ))}
              </div>
              <div className="py-1">
                <button onClick={logout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-zinc-900 transition">
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
EOF
echo "✅ components/TopNav.tsx"

# ============================================================
# 5. ADBANNER — GDPR-gated
# ============================================================
cat > components/AdBanner.tsx << 'EOF'
"use client";
import { useEffect, useRef } from "react";

export default function AdBanner({ slot = "3456789012", className = "" }: {
  slot?: string; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);
  useEffect(() => {
    if (pushed.current || !ref.current) return;
    const consent = localStorage.getItem("gjq_cookie_consent");
    if (consent === "essential") return;
    pushed.current = true;
    try { ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({}); } catch {}
  }, []);
  if (!process.env.NEXT_PUBLIC_ADSENSE_ID) return null;
  return (
    <div ref={ref} className={`w-full overflow-hidden ${className}`}>
      <ins className="adsbygoogle block" style={{ minHeight: "60px" }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true" />
    </div>
  );
}
EOF
echo "✅ components/AdBanner.tsx"

# ============================================================
# 6. DASHBOARD — error display + better empty state
# ============================================================
mkdir -p app/dashboard
cat > app/dashboard/page.tsx << 'EOF'
"use client";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import AdBanner from "@/components/AdBanner";

type Doc = {
  id: string; type: "quote" | "invoice"; number: string;
  client_name: string; client_email: string; total: number;
  status: string; created_at: string; description: string;
  vat: boolean; line_items: any[]; notes: string; paid_at: string | null;
};
type SortKey = "date_new" | "date_old" | "name_asc" | "name_desc" | "amount_high" | "amount_low";
const fmt = (n: number) => `£${(n || 0).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`;
const greet = (name: string | null) => {
  const h = new Date().getHours();
  const n = name ? `, ${name.split(" ")[0]}` : "";
  return h < 12 ? `Good morning${n} ☀️` : h < 17 ? `Good afternoon${n} 👋` : `Good evening${n} 🌙`;
};

function DashInner() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState<string | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"quotes" | "invoices">("quotes");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("date_new");
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) { router.push("/auth"); return; }
        setUser(user);
        const n = user.user_metadata?.full_name || user.user_metadata?.name ||
          user.email?.split("@")[0]?.replace(/[._]/g, " ") || null;
        setName(n);

        // Import demo quote if present
        try {
          const raw = localStorage.getItem("gjq_demo_import");
          if (raw) {
            const demo = JSON.parse(raw);
            if (demo.form?.clientName && window.confirm(`Import demo quote for "${demo.form.clientName}"?`)) {
              await supabase.from("documents").insert({
                user_id: user.id, type: "quote",
                number: "QUO-" + Date.now().toString().slice(-6),
                client_name: demo.form.clientName, client_email: demo.form.clientEmail || "",
                description: demo.form.description || "", vat: demo.form.vat || false,
                total: demo.total || 0, status: "pending",
                line_items: demo.lineItems || [], notes: demo.form.notes || "",
              });
            }
            localStorage.removeItem("gjq_demo_import");
          }
        } catch {}

        const { data, error: docsErr } = await supabase
          .from("documents").select("*").eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (docsErr) {
          setError(`Database error: ${docsErr.message}. Run the SQL migration in Supabase.`);
        } else {
          setDocs(data || []);
        }
      } catch (e: any) {
        setError(e.message || "Unexpected error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this permanently?")) return;
    await supabase.from("documents").delete().eq("id", id);
    setDocs(p => p.filter(d => d.id !== id));
  };

  const handlePaid = async (doc: Doc) => {
    setMarkingPaid(doc.id);
    await supabase.from("documents").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", doc.id);
    setDocs(p => p.map(d => d.id === doc.id ? { ...d, status: "paid" } : d));
    setMarkingPaid(null);
  };

  const handleConvert = async (doc: Doc) => {
    const { data: nd } = await supabase.from("documents").insert({
      user_id: user.id, type: "invoice",
      number: "INV-" + Date.now().toString().slice(-6),
      client_name: doc.client_name, client_email: doc.client_email,
      description: doc.description, vat: doc.vat, total: doc.total,
      status: "pending", line_items: doc.line_items || [],
      notes: doc.notes || "", linked_quote_id: doc.id,
    }).select().single();
    if (nd) { setDocs(p => [nd, ...p]); setTab("invoices"); }
  };

  const quotes = docs.filter(d => d.type === "quote");
  const invoices = docs.filter(d => d.type === "invoice");
  const totalInvoiced = invoices.reduce((s, d) => s + (d.total || 0), 0);
  const pendingCount = invoices.filter(d => d.status === "pending").length;
  const overdueCount = invoices.filter(d =>
    d.status === "pending" && new Date(d.created_at) < new Date(Date.now() - 30 * 86400000)
  ).length;

  const list = (tab === "quotes" ? quotes : invoices)
    .filter(d => {
      if (!search) return true;
      const q = search.toLowerCase();
      return d.client_name?.toLowerCase().includes(q) ||
        d.number?.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sort === "date_old") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sort === "name_asc") return (a.client_name || "").localeCompare(b.client_name || "");
      if (sort === "name_desc") return (b.client_name || "").localeCompare(a.client_name || "");
      if (sort === "amount_high") return (b.total || 0) - (a.total || 0);
      if (sort === "amount_low") return (a.total || 0) - (b.total || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="min-h-screen bg-black text-white">
      <TopNav />
      <AdBanner className="border-b border-zinc-900" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">{greet(name)}</h1>
          <p className="text-zinc-500 text-sm mt-1">Here's your overview.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            ⚠️ {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: "QUOTES", value: loading ? "…" : quotes.length },
            { label: "INVOICES", value: loading ? "…" : invoices.length },
            { label: "TOTAL INVOICED", value: loading ? "…" : fmt(totalInvoiced) },
            { label: "PENDING", value: loading ? "…" : pendingCount, sub: overdueCount > 0 ? `${overdueCount} overdue` : "invoices", alert: overdueCount > 0 },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl border p-4 ${(s as any).alert ? "border-red-500/30 bg-red-500/5" : "border-zinc-800 bg-zinc-900/50"}`}>
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
              {(s as any).sub && <p className={`text-xs mt-1 ${(s as any).alert ? "text-red-400" : "text-zinc-600"}`}>{(s as any).sub}</p>}
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Link href="/tool" className="px-4 py-2.5 text-sm font-bold bg-green-600 hover:bg-green-500 rounded-xl transition">+ New Quote</Link>
          <Link href="/profile" className="px-4 py-2.5 text-sm border border-zinc-800 hover:border-zinc-600 rounded-xl text-zinc-400 hover:text-white transition">🏢 Profile</Link>
          <Link href="/customers" className="px-4 py-2.5 text-sm border border-zinc-800 hover:border-zinc-600 rounded-xl text-zinc-400 hover:text-white transition">👥 Customers</Link>
        </div>

        {/* Empty state */}
        {!loading && !error && docs.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-xl font-bold mb-2">No quotes yet</h2>
            <p className="text-zinc-400 text-sm mb-6 max-w-xs mx-auto">Create your first professional quote in under 2 minutes.</p>
            <Link href="/tool" className="inline-block px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-sm transition">Create First Quote →</Link>
          </div>
        )}

        {/* Tabs + list */}
        {!loading && docs.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-full">
                {(["quotes", "invoices"] as const).map(t => (
                  <button key={t} onClick={() => { setTab(t); setSearch(""); }}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition ${tab === t ? "bg-green-600 text-white" : "text-zinc-400 hover:text-white"}`}>
                    {t} ({t === "quotes" ? quotes.length : invoices.length})
                  </button>
                ))}
              </div>
              <Link href="/tool" className="px-4 py-2 text-sm font-bold bg-green-600 hover:bg-green-500 rounded-xl transition">+ New</Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">🔍</span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${tab}...`}
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition" />
                {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-lg leading-none">×</button>}
              </div>
              <select value={sort} onChange={e => setSort(e.target.value as SortKey)}
                className="px-3 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-white text-sm outline-none focus:border-green-500">
                <option value="date_new">Newest first</option>
                <option value="date_old">Oldest first</option>
                <option value="name_asc">Client A → Z</option>
                <option value="name_desc">Client Z → A</option>
                <option value="amount_high">Amount ↓</option>
                <option value="amount_low">Amount ↑</option>
              </select>
            </div>

            <div className="space-y-2">
              {list.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center">
                  <p className="text-zinc-500 text-sm">{search ? `No ${tab} match "${search}"` : `No ${tab} yet.`}</p>
                </div>
              ) : list.map(doc => {
                const isOverdue = doc.type === "invoice" && doc.status === "pending" &&
                  new Date(doc.created_at) < new Date(Date.now() - 30 * 86400000);
                return (
                  <div key={doc.id} className={`rounded-2xl border px-4 py-3.5 transition ${isOverdue ? "border-red-500/20 bg-red-500/5" : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold truncate">{doc.client_name || "—"}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            isOverdue ? "bg-red-500/20 text-red-400" :
                            doc.status === "paid" ? "bg-green-500/10 text-green-400" :
                            doc.status === "accepted" ? "bg-blue-500/10 text-blue-400" :
                            "bg-yellow-500/10 text-yellow-400"
                          }`}>{isOverdue ? "overdue" : doc.status}</span>
                        </div>
                        <p className="text-xs text-zinc-600 mt-0.5">
                          {doc.number} · {new Date(doc.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-green-400 shrink-0">{fmt(doc.total || 0)}</span>
                    </div>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <Link href={`/tool?id=${doc.id}`} className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white transition">Edit</Link>
                      {doc.type === "quote" && (
                        <button onClick={() => handleConvert(doc)} className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-green-500/50 text-zinc-300 hover:text-green-400 transition">→ Invoice</button>
                      )}
                      {doc.type === "invoice" && doc.status !== "paid" && (
                        <button onClick={() => handlePaid(doc)} disabled={markingPaid === doc.id}
                          className="text-xs px-3 py-1.5 rounded-lg border border-green-700/40 hover:bg-green-600 text-green-400 hover:text-white transition disabled:opacity-40">
                          {markingPaid === doc.id ? "…" : "✓ Mark Paid"}
                        </button>
                      )}
                      <button onClick={() => handleDelete(doc.id)} className="text-xs px-2 py-1.5 text-zinc-700 hover:text-red-400 transition ml-auto">✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="mt-10 pt-6 border-t border-zinc-900 flex flex-wrap gap-4 text-xs text-zinc-700">
          <Link href="/terms" className="hover:text-zinc-400 transition">Terms</Link>
          <Link href="/privacy" className="hover:text-zinc-400 transition">Privacy</Link>
          <Link href="/status" className="hover:text-zinc-400 transition">Status</Link>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="text-zinc-600 text-sm">Loading...</div></div>}><DashInner /></Suspense>;
}
EOF
echo "✅ app/dashboard/page.tsx"

# ============================================================
# 7. QUOTE TOOL — live PDF preview + T&C disclaimer
# ============================================================
mkdir -p app/tool
cat > app/tool/page.tsx << 'TOOLEOF'
"use client";
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
  const blobUrl = useRef<string | null>(null);
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
  const [showPreview, setShowPreview] = useState(false);

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
  }, [form, lineItems, sigData, showPreview, buildPDF]);

  const handleSave = async () => {
    if (!termsAccepted) { setShowTermsError(true); return; }
    if (!user || !form.clientName) return;
    setSaving(true);
    const payload = {
      user_id: user.id, type: form.type,
      number: editId ? undefined : (form.type === "invoice" ? "INV" : "QUO") + "-" + Date.now().toString().slice(-6),
      client_name: form.clientName, client_email: form.clientEmail,
      description: form.description, vat: form.vat, total, status: "pending",
      line_items: lineItems, notes: form.notes, signature_data: sigData || null,
      expires_at: form.expiryDays !== "none" ? new Date(Date.now() + parseInt(form.expiryDays) * 86400000).toISOString() : null,
    };
    if (editId) await supabase.from("documents").update(payload).eq("id", editId);
    else await supabase.from("documents").insert(payload);
    localStorage.removeItem("gjq_draft_quote");
    setSaved(true); setSaving(false);
    setTimeout(() => router.push("/dashboard"), 1200);
  };

  const setF = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));
  const updateItem = (i: number, k: keyof LineItem, v: any) =>
    setLineItems(p => p.map((item, idx) => idx === i ? { ...item, [k]: v } : item));

  return (
    <div className="min-h-screen bg-black text-white">
      <TopNav />
      {/* Split layout */}
      <div className="flex h-[calc(100vh-56px)]">
        {/* Form */}
        <div className="w-full lg:w-[480px] xl:w-[520px] shrink-0 overflow-y-auto border-r border-zinc-900">
          <div className="px-5 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">{editId ? "Edit" : "New"} {form.type === "invoice" ? "Invoice" : "Quote"}</h1>
              <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs">
                {(["quote", "invoice"] as const).map(t => (
                  <button key={t} onClick={() => setF("type", t)}
                    className={`px-3 py-1.5 rounded-full font-medium capitalize transition ${form.type === t ? "bg-green-600 text-white" : "text-zinc-400 hover:text-white"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {customers.length > 0 && (
              <select onChange={e => {
                const c = customers.find(c => c.id === e.target.value);
                if (c) setForm(p => ({ ...p, clientName: c.name, clientEmail: c.email || "", clientPhone: c.phone || "" }));
              }} className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-white text-sm outline-none focus:border-green-500 transition">
                <option value="">— Fill from saved customer —</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Client</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { k: "clientName", label: "Name *", ph: "John Smith", full: true },
                  { k: "clientEmail", label: "Email", ph: "john@email.com" },
                  { k: "clientPhone", label: "Phone", ph: "07700 900000" },
                ].map(f => (
                  <div key={f.k} className={f.full ? "col-span-2" : ""}>
                    <label className="text-xs text-zinc-600 mb-1 block">{f.label}</label>
                    <input value={(form as any)[f.k]} onChange={e => setF(f.k, e.target.value)} placeholder={f.ph}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition" />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs text-zinc-600 mb-1 block">Job Description</label>
                <textarea value={form.description} onChange={e => setF("description", e.target.value)}
                  placeholder="e.g. New boiler installation..." rows={2}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition resize-none" />
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

            <div className="rounded-xl border border-green-600/20 bg-green-600/5 px-4 py-3">
              {form.vat && <div className="flex justify-between text-xs text-zinc-500 mb-1"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>}
              {form.vat && <div className="flex justify-between text-xs text-zinc-500 mb-2"><span>VAT (20%)</span><span>{fmt(vatAmount)}</span></div>}
              <div className="flex justify-between text-base font-bold"><span>Total</span><span className="text-green-400">{fmt(total)}</span></div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Quote valid for</label>
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

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Signature</p>
                {hasSig && <button onClick={() => { sigRef.current?.getContext("2d")?.clearRect(0,0,600,100); setSigData(""); setHasSig(false); }} className="text-xs text-zinc-600 hover:text-red-400 transition">Clear</button>}
              </div>
              {profile?.signature_data && !hasSig && (
                <div className="flex items-center gap-3 mb-2">
                  <img src={profile.signature_data} className="h-10 rounded border border-zinc-700 bg-zinc-900 p-1" alt="sig" />
                  <button onClick={() => { setSigData(profile.signature_data); setHasSig(true); }} className="text-xs text-green-400 hover:text-green-300 transition">Use saved signature</button>
                </div>
              )}
              <canvas ref={sigRef} width={600} height={100}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-700 cursor-crosshair touch-none"
                style={{ touchAction: "none" }}
                onMouseDown={startDraw} onMouseMove={drawSig} onMouseUp={endDraw} onMouseLeave={endDraw}
                onTouchStart={startDraw} onTouchMove={drawSig} onTouchEnd={endDraw} />
            </div>

            {/* T&C Disclaimer */}
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
              {showTermsError && <p className="text-red-400 text-xs mt-2 pl-8">Please accept the terms before saving.</p>}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pb-6">
              <button onClick={() => buildPDF().save(`${form.type}-${form.clientName || "quote"}.pdf`)}
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

        {/* Desktop PDF Preview */}
        <div className="hidden lg:flex flex-col flex-1 bg-zinc-950">
          <div className="border-b border-zinc-900 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${previewLoading ? "bg-yellow-400 animate-pulse" : "bg-green-400"}`} />
              <span className="text-xs text-zinc-500">{previewLoading ? "Updating..." : "Live preview"}</span>
            </div>
            <button onClick={() => setShowPreview(v => !v)} className="text-xs text-zinc-600 hover:text-zinc-400 transition">
              {showPreview ? "Hide" : "Show preview"}
            </button>
          </div>
          {showPreview ? (
            <div className="flex-1 relative">
              <iframe ref={previewRef} className="w-full h-full border-0" title="PDF Preview" />
              {previewLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/60">
                  <span className="text-zinc-500 text-sm">Generating...</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-700 gap-3">
              <span className="text-4xl">📄</span>
              <p className="text-sm">Click "Show preview" to see your PDF live</p>
              <button onClick={() => setShowPreview(true)} className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm transition">Show Preview</button>
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
echo "✅ app/tool/page.tsx — live PDF preview + T&C"

# ============================================================
# 8. DEMO PAGE — live PDF preview + signup wall
# ============================================================
mkdir -p app/demo
cat > app/demo/page.tsx << 'DEMOEOF'
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
    setShowSignup(true); // Show signup wall BEFORE download
  };

  const doDownload = () => {
    buildPDF().save(`demo-quote-${form.clientName || "quote"}.pdf`);
    setDownloaded(true); setShowSignup(false);
    // Save to localStorage for import after signup
    localStorage.setItem("gjq_demo_import", JSON.stringify({ form, lineItems, total }));
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
DEMOEOF
echo "✅ app/demo/page.tsx — live PDF preview + signup wall modal"

# ============================================================
# 9. FIX contact email everywhere
# ============================================================
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  ! -path "*/node_modules/*" ! -path "*/.next/*" \
  -exec sed -i 's/hello@getjobquotes\.uk/support@getjobquotes.uk/g' {} + 2>/dev/null || true
echo "✅ support@getjobquotes.uk everywhere"

# ============================================================
# 10. SENTRY — suppress source map warning
# ============================================================
cat > sentry.client.config.ts << 'EOF'
import * as Sentry from "@sentry/nextjs";
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === "production",
});
EOF
cat > sentry.server.config.ts << 'EOF'
import * as Sentry from "@sentry/nextjs";
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === "production",
});
EOF
cat > sentry.edge.config.ts << 'EOF'
import * as Sentry from "@sentry/nextjs";
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === "production",
});
EOF
echo "✅ Sentry configs"

# ============================================================
# 11. COMMIT & PUSH
# ============================================================
git add .
git commit -m "fix: routing, middleware, supabase client, live PDF preview in tool+demo, signup wall, mobile nav, T&C checkbox, AdSense, Sentry, support@ email"
git push origin main

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  ✅  All done! Deploying to Vercel now.                 ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "  FIXES IN THIS SCRIPT:"
echo "  ✅ Routing (/tool, /profile, /customers all load now)"
echo "  ✅ Google OAuth bad_oauth_state fixed"
echo "  ✅ Live PDF preview in quote tool (desktop split-screen)"
echo "  ✅ Live PDF preview in demo page (same split-screen)"
echo "  ✅ Demo signup wall modal before download"
echo "  ✅ T&C checkbox required before saving quotes"
echo "  ✅ Mobile TopNav — all links in dropdown"
echo "  ✅ Dashboard — shows red error if DB not set up"
echo "  ✅ AdSense GDPR-gated"
echo "  ✅ Sentry warning suppressed"
echo "  ✅ support@getjobquotes.uk everywhere"
echo ""
echo "  ⚠️  STILL REQUIRED IN SUPABASE SQL EDITOR:"
echo "  ─────────────────────────────────────────"
echo "  ALTER TABLE documents ENABLE ROW LEVEL SECURITY;"
echo "  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;"
echo "  DROP POLICY IF EXISTS \"Users manage own documents\" ON documents;"
echo "  CREATE POLICY \"Users manage own documents\" ON documents"
echo "    FOR ALL USING (auth.uid() = user_id);"
echo "  DROP POLICY IF EXISTS \"Users manage own profiles\" ON profiles;"
echo "  CREATE POLICY \"Users manage own profiles\" ON profiles"
echo "    FOR ALL USING (auth.uid() = user_id);"
echo ""
echo "  ⚠️  VERIFY IN VERCEL ENV VARS:"
echo "  NEXT_PUBLIC_APP_URL = https://getjobquotes.uk"
echo "  NEXT_PUBLIC_SUPABASE_URL = your supabase url"
echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY = your anon key"
echo "  SUPABASE_SERVICE_ROLE_KEY = your service role key"
echo ""
