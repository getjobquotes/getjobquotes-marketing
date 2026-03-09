#!/bin/bash
# Run this from your project root: ~/projects/getjobquotes-marketing

# ============================================================
# 1. TopNav component
# ============================================================
mkdir -p components

cat > components/TopNav.tsx << 'ENDOFFILE'
"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";

export default function TopNav() {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  const [displayName, setDisplayName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [initials, setInitials] = useState("?");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email || null);

      const metaName = user.user_metadata?.full_name || user.user_metadata?.name;
      const emailName = user.email
        ?.split("@")[0]
        ?.replace(/[._]/g, " ")
        ?.replace(/\b\w/g, (c: string) => c.toUpperCase());

      const name = metaName || emailName || null;
      setDisplayName(name);

      if (name) {
        const parts = name.trim().split(" ");
        setInitials(
          parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : parts[0].slice(0, 2).toUpperCase()
        );
      } else if (user.email) {
        setInitials(user.email[0].toUpperCase());
      }
    };
    load();
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/tool", label: "New Quote" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-900 bg-black/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">

        <Link href="/" className="text-base font-bold shrink-0">
          <span className="text-green-400">Get</span>JobQuotes
        </Link>

        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-full px-1.5 py-1.5">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                  active
                    ? "bg-green-600 text-white"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="w-9 h-9 rounded-full bg-green-600 hover:bg-green-500 text-white text-sm font-bold flex items-center justify-center transition ring-2 ring-transparent hover:ring-green-500/40"
          >
            {initials}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-zinc-800">
                <p className="text-sm font-semibold text-white truncate">{displayName || "Your Account"}</p>
                <p className="text-xs text-zinc-500 truncate">{email}</p>
              </div>

              <div className="py-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-900 transition"
                  >
                    {link.label === "Dashboard" ? "📊" : "📋"} {link.label}
                  </Link>
                ))}
              </div>

              <div className="border-t border-zinc-800 py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-zinc-900 transition text-left"
                >
                  🚪 Log Out
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}
ENDOFFILE

echo "✅ TopNav.tsx created"

# ============================================================
# 2. Dashboard page
# ============================================================
mkdir -p app/dashboard

cat > app/dashboard/page.tsx << 'ENDOFFILE'
"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import TopNav from "@/components/TopNav";

type Document = {
  id: string;
  type: "quote" | "invoice";
  number: string;
  client_name: string;
  total: number;
  status: string;
  created_at: string;
  description: string;
  labour_cost: number;
  materials_cost: number;
  vat: boolean;
  client_email: string;
};

function getGreeting(name: string | null) {
  const hour = new Date().getHours();
  const first = name?.split(" ")[0] || null;
  const suffix = first ? `, ${first}` : "";
  if (hour < 12) return `Good morning${suffix} ☀️`;
  if (hour < 17) return `Good afternoon${suffix} 👋`;
  return `Good evening${suffix} 🌙`;
}

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"quotes" | "invoices">("quotes");
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      setUser(user);

      const metaName = user.user_metadata?.full_name || user.user_metadata?.name;
      const emailName = user.email
        ?.split("@")[0]
        ?.replace(/[._]/g, " ")
        ?.replace(/\b\w/g, (c: string) => c.toUpperCase());
      setDisplayName(metaName || emailName || null);

      const name = metaName || emailName || null;
      if (name) localStorage.setItem("gjq_display_name", name);
      if (user.email) localStorage.setItem("gjq_email", user.email);

      const created = new Date(user.created_at).getTime();
      if (Date.now() - created < 120000) setIsFirstVisit(true);

      const { data } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setDocs(data || []);
      setLoading(false);
    };
    init();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    await supabase.from("documents").delete().eq("id", id);
    setDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const handleConvert = async (doc: Document) => {
    const invoiceNumber = "INV-" + Date.now().toString().slice(-6);
    const { error } = await supabase.from("documents").insert({
      user_id: user.id,
      type: "invoice",
      number: invoiceNumber,
      client_name: doc.client_name,
      client_email: doc.client_email,
      description: doc.description,
      labour_cost: doc.labour_cost,
      materials_cost: doc.materials_cost,
      vat: doc.vat,
      total: doc.total,
      status: "pending",
      linked_quote_id: doc.id,
    });
    if (!error) {
      const { data } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setDocs(data || []);
      setActiveTab("invoices");
    }
  };

  const quotes = docs.filter((d) => d.type === "quote");
  const invoices = docs.filter((d) => d.type === "invoice");
  const totalInvoiced = invoices.reduce((sum, d) => sum + d.total, 0);
  const displayed = activeTab === "quotes" ? quotes : invoices;

  return (
    <div className="min-h-screen bg-black text-white">
      <TopNav />

      <div className="max-w-5xl mx-auto px-6 py-10">

        <div className="mb-8">
          {isFirstVisit ? (
            <>
              <h1 className="text-3xl font-bold mb-1">
                👋 Welcome to GetJobQuotes{displayName ? `, ${displayName.split(" ")[0]}` : ""}!
              </h1>
              <p className="text-zinc-400 text-sm">Your account is all set up. Create your first quote below — it takes under 2 minutes.</p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-1">{getGreeting(displayName)}</h1>
              <p className="text-zinc-400 text-sm">Here's your quote and invoice overview.</p>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Quotes", value: quotes.length },
            { label: "Invoices", value: invoices.length },
            { label: "Total Invoiced", value: `£${totalInvoiced.toLocaleString("en-GB", { minimumFractionDigits: 2 })}` },
            { label: "Pending", value: invoices.filter((d) => d.status === "pending").length, sub: "invoices" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-white">{loading ? "—" : s.value}</p>
              {s.sub && <p className="text-xs text-zinc-600 mt-0.5">{s.sub}</p>}
            </div>
          ))}
        </div>

        {!loading && docs.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-14 text-center mb-10">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-xl font-semibold mb-2">No quotes yet</h2>
            <p className="text-zinc-400 text-sm mb-6 max-w-xs mx-auto">
              Create your first quote and download a professional PDF in minutes.
            </p>
            <Link href="/tool"
              className="inline-block px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-semibold text-sm transition">
              Create First Quote
            </Link>
          </div>
        )}

        {docs.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-5">
              <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-full">
                {(["quotes", "invoices"] as const).map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-5 py-1.5 rounded-full text-sm font-semibold capitalize transition ${
                      activeTab === tab ? "bg-green-600 text-white" : "text-zinc-400 hover:text-white"
                    }`}>
                    {tab} ({tab === "quotes" ? quotes.length : invoices.length})
                  </button>
                ))}
              </div>
              <Link href="/tool"
                className="px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-500 rounded-lg transition">
                + New Quote
              </Link>
            </div>

            <div className="space-y-2">
              {displayed.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-800 p-10 text-center">
                  <p className="text-zinc-500 text-sm">
                    {activeTab === "invoices" ? "No invoices yet — convert a quote to create one." : "No quotes yet."}
                  </p>
                </div>
              ) : (
                displayed.map((doc) => (
                  <div key={doc.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 px-5 py-4 hover:border-zinc-700 transition">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-sm font-semibold text-white truncate">{doc.client_name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          doc.status === "pending" ? "bg-yellow-500/10 text-yellow-400"
                          : doc.status === "paid" ? "bg-green-500/10 text-green-400"
                          : "bg-zinc-800 text-zinc-400"
                        }`}>{doc.status}</span>
                      </div>
                      <p className="text-xs text-zinc-500">{doc.number} · {new Date(doc.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                      <span className="text-base font-bold text-green-400">
                        £{doc.total.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                      </span>
                      <Link href={`/tool?id=${doc.id}`}
                        className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white transition">
                        View
                      </Link>
                      {doc.type === "quote" && (
                        <button onClick={() => handleConvert(doc)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-green-500 text-zinc-300 hover:text-green-400 transition">
                          → Invoice
                        </button>
                      )}
                      <button onClick={() => handleDelete(doc.id)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-red-500/40 text-zinc-600 hover:text-red-400 transition">
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
ENDOFFILE

echo "✅ app/dashboard/page.tsx created"

# ============================================================
# 3. Auth page
# ============================================================
mkdir -p app/auth

cat > app/auth/page.tsx << 'ENDOFFILE'
"use client";

import { createClient } from "@/lib/supabase/client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

function AuthForm() {
  const supabase = createClient();
  const params = useSearchParams();
  const router = useRouter();
  const mode = params.get("mode") || "login";

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [returningUser, setReturningUser] = useState(false);
  const [returningName, setReturningName] = useState<string | null>(null);

  const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`;

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) { router.push("/dashboard"); return; }
      const savedName = localStorage.getItem("gjq_display_name");
      const savedEmail = localStorage.getItem("gjq_email");
      if (savedEmail) {
        setReturningUser(true);
        setReturningName(savedName);
        setEmail(savedEmail);
      }
    };
    check();
  }, []);

  const handleEmailAuth = async () => {
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectUrl },
    });
    setLoading(false);
    if (error) {
      setMessage(error.message);
    } else {
      localStorage.setItem("gjq_email", email);
      setSent(true);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUrl },
    });
    if (error) { setLoading(false); setMessage(error.message); }
  };

  if (sent) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="text-6xl mb-6">📬</div>
        <h2 className="text-2xl font-bold text-white mb-3">Check your inbox</h2>
        <p className="text-zinc-400 mb-2">We sent a magic link to</p>
        <p className="text-green-400 font-semibold mb-6">{email}</p>
        <p className="text-zinc-500 text-sm mb-8">Click the link in that email to sign in instantly — no password needed.</p>
        <button onClick={() => setSent(false)}
          className="text-sm text-zinc-500 hover:text-zinc-300 transition underline underline-offset-4">
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <Link href="/" className="text-xl font-bold">
          <span className="text-green-400">Get</span>JobQuotes
        </Link>

        {returningUser && returningName ? (
          <>
            <h1 className="mt-5 text-3xl font-bold text-white">Welcome back, {returningName.split(" ")[0]} 👋</h1>
            <p className="mt-2 text-zinc-400 text-sm">Sign in to access your quotes and invoices.</p>
          </>
        ) : returningUser ? (
          <>
            <h1 className="mt-5 text-3xl font-bold text-white">Welcome back 👋</h1>
            <p className="mt-2 text-zinc-400 text-sm">Sign in to access your quotes and invoices.</p>
          </>
        ) : mode === "signup" ? (
          <>
            <h1 className="mt-5 text-3xl font-bold text-white">Create your account</h1>
            <p className="mt-2 text-zinc-400 text-sm">Start creating professional quotes for free. No card needed.</p>
          </>
        ) : (
          <>
            <h1 className="mt-5 text-3xl font-bold text-white">Sign in</h1>
            <p className="mt-2 text-zinc-400 text-sm">Access your quotes and invoices.</p>
          </>
        )}
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm p-8 shadow-2xl">
        <button onClick={handleGoogle} disabled={loading}
          className="w-full flex items-center justify-center gap-3 rounded-xl border border-zinc-700 bg-white px-4 py-3 text-black text-sm font-semibold transition hover:bg-zinc-100 disabled:opacity-60 mb-2">
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
          <span className="ml-auto text-xs text-zinc-400 font-normal">Recommended</span>
        </button>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-xs text-zinc-600">or use email</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && email && handleEmailAuth()}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition mb-3"
        />

        <button onClick={handleEmailAuth} disabled={loading || !email}
          className="w-full rounded-xl bg-green-600 hover:bg-green-500 py-3 text-sm font-semibold text-white transition disabled:opacity-50">
          {loading ? "Sending magic link..." : "Send Magic Link"}
        </button>

        {message && <p className="mt-4 text-center text-sm text-red-400">{message}</p>}

        <p className="mt-5 text-center text-xs text-zinc-600">
          We'll email you a sign-in link — no password needed.
        </p>
      </div>

      <p className="mt-6 text-center text-sm text-zinc-500">
        {mode === "signup" ? "Already have an account? " : "Don't have an account? "}
        <Link href={mode === "signup" ? "/auth?mode=login" : "/auth?mode=signup"}
          className="text-green-400 hover:text-green-300 transition underline underline-offset-4">
          {mode === "signup" ? "Log In" : "Sign Up Free"}
        </Link>
      </p>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/8 rounded-full blur-[100px]" />
      </div>
      <div className="relative z-10 w-full max-w-md">
        <Suspense fallback={<div className="text-zinc-500 text-center text-sm">Loading...</div>}>
          <AuthForm />
        </Suspense>
      </div>
    </div>
  );
}
ENDOFFILE

echo "✅ app/auth/page.tsx created"

# ============================================================
# 4. Tool page (quote form with TopNav)
# ============================================================
mkdir -p app/tool

cat > app/tool/page.tsx << 'ENDOFFILE'
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
ENDOFFILE

echo "✅ app/tool/page.tsx created"

# ============================================================
# 5. Commit and push
# ============================================================
git add .
git commit -m "feat: TopNav, polished dashboard, auth, and tool pages with personal touches"
git push

echo ""
echo "🚀 All done! Vercel will deploy in ~60 seconds."
echo "   Check: https://getjobquotes.uk"
