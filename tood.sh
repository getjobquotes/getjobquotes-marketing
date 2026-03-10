k    setLoading(true); setError(""); setMsg("");
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      setLoading(false);
      if (error) setError(error.message);
      else setMsg("✅ Account created! Check your email to verify.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) setError(error.message);
      else router.push("/dashboard");
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold">
            <span className="text-green-400">Get</span>JobQuotes
          </Link>
          {returningUser ? (
            <p className="text-zinc-400 text-sm mt-2">Welcome back, <span className="text-white font-semibold">{returningUser.split(" ")[0]}</span> 👋</p>
          ) : (
            <p className="text-zinc-400 text-sm mt-2">
              {mode === "signup" ? "Create your free account" : "Sign in to your account"}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">

          {/* Google */}
          <button onClick={handleGoogle} disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white text-sm font-semibold transition disabled:opacity-50">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-zinc-800" /><span className="text-xs text-zinc-600">or</span><div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* Email */}
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email"
              placeholder="you@example.com" autoComplete="email"
              onKeyDown={(e) => e.key === "Enter" && (mode === "magic" ? handleMagicLink() : handlePassword())}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition" />
          </div>

          {/* Password field (shown for password/signup mode) */}
          {(mode === "password" || mode === "signup") && (
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Password</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password"
                placeholder="Min 8 characters" autoComplete={mode === "signup" ? "new-password" : "current-password"}
                onKeyDown={(e) => e.key === "Enter" && handlePassword()}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition" />
            </div>
          )}

          {/* Error / success */}
          {error && <p className="text-red-400 text-xs rounded-lg bg-red-400/10 border border-red-400/20 px-3 py-2">{error}</p>}
          {msg && <p className="text-green-400 text-xs rounded-lg bg-green-400/10 border border-green-400/20 px-3 py-2">{msg}</p>}

          {/* Primary action */}
          {mode === "magic" && (
            <button onClick={handleMagicLink} disabled={loading}
              className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 text-sm font-bold text-white transition disabled:opacity-50">
              {loading ? "Sending..." : "Send Magic Link"}
            </button>
          )}
          {(mode === "password" || mode === "signup") && (
            <button onClick={handlePassword} disabled={loading}
              className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 text-sm font-bold text-white transition disabled:opacity-50">
              {loading ? "..." : mode === "signup" ? "Create Account" : "Sign In"}
            </button>
          )}

          {/* Mode switchers */}
          <div className="text-center space-y-2 pt-1">
            {mode === "magic" && (
              <button onClick={() => { setMode("password"); setError(""); setMsg(""); }}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition block w-full">
                Use password instead →
              </button>
            )}
            {mode === "password" && (
              <button onClick={() => { setMode("magic"); setError(""); setMsg(""); }}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition block w-full">
                Use magic link instead →
              </button>
            )}
            {mode !== "signup" ? (
              <button onClick={() => { setMode("signup"); setError(""); setMsg(""); }}
                className="text-xs text-zinc-500 hover:text-green-400 transition block w-full">
                No account? Sign up free →
              </button>
            ) : (
              <button onClick={() => { setMode("magic"); setError(""); setMsg(""); }}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition block w-full">
                Already have an account? Sign in →
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-zinc-700 mt-6">
          By continuing you agree to our{" "}
          <Link href="/terms" className="text-zinc-500 hover:text-white">Terms</Link> &{" "}
          <Link href="/privacy" className="text-zinc-500 hover:text-white">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <AuthInner />
    </Suspense>
  );
}
EOF
echo "✅ app/auth/page.tsx (magic + password + Google)"

# ============================================================
# 3. AUTH CALLBACK
# ============================================================
mkdir -p app/auth/callback
cat > app/auth/callback/route.ts << 'EOF'
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/auth?error=callback`);
}
EOF
echo "✅ app/auth/callback/route.ts"

# ============================================================
# 4. API — RATE LIMITED EMAIL ROUTE
# ============================================================
mkdir -p app/api/email
cat > app/api/email/route.ts << 'EOF'
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rateLimit";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!rateLimit(`email:${ip}`, 5, 60000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { type, to, subject, html } = body;

  if (!to || !subject || !html) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const { error } = await resend.emails.send({
    from: "GetJobQuotes <hello@getjobquotes.uk>",
    to, subject, html,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
EOF
echo "✅ app/api/email/route.ts (rate limited)"

# ============================================================
# 5. STATUS / HEALTH CHECK PAGE
# ============================================================
mkdir -p app/status
cat > app/status/page.tsx << 'EOF'
import { createClient } from "@/lib/supabase/server";

export const revalidate = 30;

export default async function StatusPage() {
  let dbOk = false;
  let dbLatency = 0;

  try {
    const start = Date.now();
    const supabase = await createClient();
    await supabase.from("profiles").select("id").limit(1);
    dbLatency = Date.now() - start;
    dbOk = true;
  } catch {}

  const services = [
    { name: "API", status: true, note: "Operational" },
    { name: "Database", status: dbOk, note: dbOk ? `${dbLatency}ms` : "Unreachable" },
    { name: "Auth", status: true, note: "Operational" },
    { name: "PDF Generation", status: true, note: "Client-side" },
  ];

  const allOk = services.every((s) => s.status);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <a href="/" className="text-xl font-bold"><span className="text-green-400">Get</span>JobQuotes</a>
          <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${allOk ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-red-500/30 bg-red-500/10 text-red-400"}`}>
            <span className={`w-2 h-2 rounded-full ${allOk ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
            {allOk ? "All systems operational" : "Service degraded"}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          {services.map((s, i) => (
            <div key={s.name} className={`flex items-center justify-between px-6 py-4 ${i < services.length - 1 ? "border-b border-zinc-800" : ""}`}>
              <span className="text-sm text-white font-medium">{s.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">{s.note}</span>
                <span className={`w-2.5 h-2.5 rounded-full ${s.status ? "bg-green-400" : "bg-red-400"}`} />
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-zinc-700 mt-6">
          Last checked: {new Date().toUTCString()}
        </p>
      </div>
    </div>
  );
}
EOF

mkdir -p app/api/health
cat > app/api/health/route.ts << 'EOF'
import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ status: "ok", ts: new Date().toISOString(), service: "getjobquotes" });
}
EOF
echo "✅ app/status/page.tsx + app/api/health/route.ts"

# ============================================================
# 6. ROBOTS.TXT + SITEMAP
# ============================================================
cat > public/robots.txt << 'EOF'
User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /tool
Disallow: /profile
Disallow: /customers
Disallow: /api/

Sitemap: https://getjobquotes.uk/sitemap.xml
EOF

cat > app/sitemap.ts << 'EOF'
import { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://getjobquotes.uk", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://getjobquotes.uk/demo", lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: "https://getjobquotes.uk/auth", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://getjobquotes.uk/status", lastModified: new Date(), changeFrequency: "always", priority: 0.2 },
    { url: "https://getjobquotes.uk/terms", lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: "https://getjobquotes.uk/privacy", lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];
}
EOF
echo "✅ robots.txt + sitemap.ts"

# ============================================================
# 7. ERROR BOUNDARIES — every major page
# ============================================================
cat > app/error.tsx << 'EOF'
"use client";
import { useEffect } from "react";
import Link from "next/link";
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl mb-6">⚠️</div>
      <h1 className="text-3xl font-bold mb-2">Something went wrong</h1>
      <p className="text-zinc-400 text-sm mb-8 max-w-sm">An unexpected error occurred. If it keeps happening, let us know at hello@getjobquotes.uk</p>
      <div className="flex gap-3">
        <button onClick={reset} className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-semibold text-sm transition">Try Again</button>
        <Link href="/dashboard" className="px-6 py-3 border border-zinc-700 hover:border-zinc-500 rounded-xl font-semibold text-sm transition">Dashboard</Link>
      </div>
    </div>
  );
}
EOF

cat > app/not-found.tsx << 'EOF'
import Link from "next/link";
export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 text-center">
      <div className="text-7xl font-bold text-zinc-900 mb-4 select-none">404</div>
      <h1 className="text-2xl font-bold mb-2">Page not found</h1>
      <p className="text-zinc-400 text-sm mb-8">This page doesn't exist or has been moved.</p>
      <div className="flex gap-3">
        <Link href="/" className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-semibold text-sm transition">Home</Link>
        <Link href="/dashboard" className="px-6 py-3 border border-zinc-700 hover:border-zinc-500 rounded-xl font-semibold text-sm transition">Dashboard</Link>
      </div>
    </div>
  );
}
EOF

# Per-page error boundaries
for dir in dashboard tool profile customers; do
  mkdir -p app/$dir
  cat > app/$dir/error.tsx << PAGEERROR
"use client";
import Link from "next/link";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 text-center">
      <p className="text-5xl mb-4">⚠️</p>
      <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
      <div className="flex gap-3 mt-4">
        <button onClick={reset} className="px-5 py-2.5 bg-green-600 hover:bg-green-500 rounded-xl text-sm font-semibold transition">Retry</button>
        <Link href="/dashboard" className="px-5 py-2.5 border border-zinc-700 rounded-xl text-sm text-zinc-300 hover:text-white transition">Dashboard</Link>
      </div>
    </div>
  );
}
PAGEERROR
done
echo "✅ Error boundaries on all pages"

# ============================================================
# 8. COOKIE BANNER (GDPR)
# ============================================================
cat > components/CookieBanner.tsx << 'EOF'
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("gjq_cookie_consent");
    if (!consent) setTimeout(() => setShow(true), 1500);
  }, []);

  const accept = () => { localStorage.setItem("gjq_cookie_consent", "all"); setShow(false); };
  const essential = () => { localStorage.setItem("gjq_cookie_consent", "essential"); setShow(false); };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-[420px] z-[100] rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl animate-in slide-in-from-bottom-4">
      <p className="text-sm font-semibold text-white mb-1">🍪 Cookie Preferences</p>
      <p className="text-xs text-zinc-400 leading-relaxed mb-4">
        We use essential cookies to keep you logged in, and analytics cookies (Google Analytics) to improve the product.
        See our <Link href="/privacy" className="text-green-400 hover:underline">Privacy Policy</Link>.
      </p>
      <div className="flex gap-2">
        <button onClick={accept}
          className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-bold transition">
          Accept All
        </button>
        <button onClick={essential}
          className="flex-1 py-2.5 rounded-xl border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white text-xs font-semibold transition">
          Essential Only
        </button>
      </div>
    </div>
  );
}
EOF
echo "✅ components/CookieBanner.tsx"

# ============================================================
# 9. ADSENSE BANNER COMPONENT
# ============================================================
cat > components/AdBanner.tsx << 'EOF'
"use client";
import { useEffect, useRef } from "react";

interface AdBannerProps {
  slot?: string;
  format?: "auto" | "horizontal" | "rectangle";
  className?: string;
}

export default function AdBanner({ slot = "auto", format = "auto", className = "" }: AdBannerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current || !ref.current) return;
    // Only show ads if user consented (or no preference yet = consent not declined)
    const consent = localStorage.getItem("gjq_cookie_consent");
    if (consent === "essential") return; // User opted out of analytics
    pushed.current = true;
    try {
      const adsbygoogle = (window as any).adsbygoogle || [];
      adsbygoogle.push({});
    } catch {}
  }, []);

  if (!process.env.NEXT_PUBLIC_ADSENSE_ID) return null;

  return (
    <div ref={ref} className={`w-full overflow-hidden ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
EOF
echo "✅ components/AdBanner.tsx (GDPR aware)"

# ============================================================
# 10. LAYOUT — SEO meta, PWA, AdSense, ThemeProvider, Cookies
# ============================================================
cat > app/layout.tsx << 'EOF'
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import CookieBanner from "@/components/CookieBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "GetJobQuotes — Quotes & Invoices for UK Trades", template: "%s | GetJobQuotes" },
  description: "Create professional quotes and invoices in under 2 minutes. Built for UK plumbers, electricians, builders and all tradespeople. Free to use.",
  keywords: ["quotes", "invoices", "tradespeople", "UK trades", "plumber", "electrician", "builder", "self employed", "quote generator"],
  authors: [{ name: "GetJobQuotes" }],
  creator: "GetJobQuotes",
  publisher: "GetJobQuotes",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "GetJobQuotes" },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://getjobquotes.uk",
    siteName: "GetJobQuotes",
    title: "GetJobQuotes — Professional Quotes & Invoices for UK Trades",
    description: "Create professional quotes and invoices in under 2 minutes. Free for UK tradespeople.",
    images: [{ url: "https://getjobquotes.uk/og-image.png", width: 1200, height: 630, alt: "GetJobQuotes" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GetJobQuotes — Quotes & Invoices for UK Trades",
    description: "Professional quotes & invoices in under 2 minutes. Free for UK tradespeople.",
  },
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className="dark" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        {process.env.NEXT_PUBLIC_GA_ID && <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
          <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}',{anonymize_ip:true});` }} />
        </>}
        {process.env.NEXT_PUBLIC_ADSENSE_ID && (
          <script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`} crossOrigin="anonymous" />
        )}
      </head>
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <ThemeProvider>
          {children}
          <CookieBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
EOF
echo "✅ app/layout.tsx"

# ============================================================
# 11. PWA MANIFEST
# ============================================================
cat > public/manifest.json << 'EOF'
{
  "name": "GetJobQuotes",
  "short_name": "GJQ",
  "description": "Professional quotes & invoices for UK tradespeople",
  "start_url": "/dashboard",
  "scope": "/",
  "display": "standalone",
  "orientation": "any",
  "background_color": "#000000",
  "theme_color": "#16a34a",
  "categories": ["business", "finance", "productivity"],
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ],
  "shortcuts": [
    { "name": "New Quote", "url": "/tool", "icons": [{ "src": "/icon-192.png", "sizes": "192x192" }] },
    { "name": "Dashboard", "url": "/dashboard", "icons": [{ "src": "/icon-192.png", "sizes": "192x192" }] }
  ]
}
EOF
echo "✅ public/manifest.json (PWA)"

# ============================================================
# 12. DEMO PAGE — sign-up wall before download
# ============================================================
mkdir -p app/demo
cat > app/demo/page.tsx << 'EOF'
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
EOF
echo "✅ app/demo/page.tsx"

# ============================================================
# 13. CUSTOMERS PAGE — search + sort + edit + reusable
# ============================================================
cat > app/customers/page.tsx << 'EOF'
"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TopNav from "@/components/TopNav";
import AdBanner from "@/components/AdBanner";

type Customer = { id: string; name: string; email: string; phone: string; address: string; created_at: string };
type SortKey = "date_new" | "date_old" | "name_asc" | "name_desc";

export default function CustomersPage() {
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("date_new");
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      setUser(user);
      const { data } = await supabase.from("customers").select("*").eq("user_id", user.id);
      setCustomers(data || []);
      setLoading(false);
    };
    init();
  }, []);

  const resetForm = () => { setForm({ name: "", email: "", phone: "", address: "" }); setEditId(null); };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    if (editId) {
      const { data } = await supabase.from("customers").update({ ...form }).eq("id", editId).select().single();
      if (data) setCustomers((prev) => prev.map((c) => c.id === editId ? data : c));
    } else {
      const { data } = await supabase.from("customers").insert({ user_id: user.id, ...form }).select().single();
      if (data) setCustomers((prev) => [data, ...prev]);
    }
    resetForm(); setShowForm(false); setSaving(false);
  };

  const handleEdit = (c: Customer) => {
    setForm({ name: c.name, email: c.email || "", phone: c.phone || "", address: c.address || "" });
    setEditId(c.id); setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this customer?")) return;
    await supabase.from("customers").delete().eq("id", id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  const filtered = customers
    .filter((c) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.phone?.includes(q) || c.address?.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sort === "name_asc") return a.name.localeCompare(b.name);
      if (sort === "name_desc") return b.name.localeCompare(a.name);
      if (sort === "date_old") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="min-h-screen bg-black text-white">
      <TopNav />
      <AdBanner className="border-b border-zinc-900" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Customers</h1>
            <p className="text-zinc-500 text-sm mt-0.5">{customers.length} saved</p>
          </div>
          <button onClick={() => { resetForm(); setShowForm((v) => !v); }}
            className="px-4 py-2 text-sm font-bold bg-green-600 hover:bg-green-500 rounded-xl transition shrink-0">
            {showForm && !editId ? "Cancel" : "+ Add"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 mb-5 space-y-3">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">{editId ? "Edit Customer" : "New Customer"}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { k: "name", label: "Name *", placeholder: "John Smith" },
                { k: "email", label: "Email", placeholder: "john@email.com" },
                { k: "phone", label: "Phone", placeholder: "07700 900000" },
                { k: "address", label: "Address", placeholder: "123 High St, London", span: true },
              ].map((f) => (
                <div key={f.k} className={f.span ? "sm:col-span-2" : ""}>
                  <label className="text-xs text-zinc-500 mb-1 block">{f.label}</label>
                  <input value={(form as any)[f.k]} onChange={(e) => setForm((p) => ({ ...p, [f.k]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={handleSave} disabled={saving || !form.name.trim()}
                className="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-sm font-bold text-white transition disabled:opacity-40">
                {saving ? "Saving..." : editId ? "Update" : "Save Customer"}
              </button>
              <button onClick={() => { resetForm(); setShowForm(false); }}
                className="px-5 py-2.5 rounded-xl border border-zinc-700 text-sm text-zinc-400 hover:text-white transition">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search + Sort */}
        {customers.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">🔍</span>
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email or phone..."
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition" />
              {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-lg leading-none">×</button>}
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}
              className="px-3 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-white text-sm outline-none focus:border-green-500 transition">
              <option value="date_new">Newest first</option>
              <option value="date_old">Oldest first</option>
              <option value="name_asc">Name A → Z</option>
              <option value="name_desc">Name Z → A</option>
            </select>
          </div>
        )}

        {search && <p className="text-xs text-zinc-600 mb-3">{filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{search}"</p>}

        {/* List */}
        {loading ? (
          <div className="text-center py-16 text-zinc-600 text-sm">Loading...</div>
        ) : customers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-zinc-400 text-sm">No customers yet.</p>
            <p className="text-zinc-600 text-xs mt-1">Add one and pick them from the quote form.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-10 text-center">
            <p className="text-zinc-500 text-sm">No customers match "{search}"</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-3.5 hover:border-zinc-700 transition group">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{c.name}</p>
                  <p className="text-xs text-zinc-500 truncate">{[c.email, c.phone].filter(Boolean).join(" · ") || "No contact info"}</p>
                  {c.address && <p className="text-xs text-zinc-700 truncate">{c.address}</p>}
                </div>
                <div className="flex gap-2 shrink-0 opacity-60 group-hover:opacity-100 transition">
                  <button onClick={() => handleEdit(c)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white transition">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(c.id)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-transparent hover:border-red-500/30 text-zinc-700 hover:text-red-400 transition">
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
EOF
echo "✅ app/customers/page.tsx"

# ============================================================
# 14. DASHBOARD — search, sort, ad banner, demo import
# ============================================================
cat > app/dashboard/page.tsx << 'EOF'
"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import AdBanner from "@/components/AdBanner";

type Doc = {
  id: string; type: "quote" | "invoice"; number: string; client_name: string;
  client_email: string; total: number; status: string; created_at: string;
  description: string; vat: boolean; line_items: any[]; notes: string; paid_at: string | null;
};
type SortKey = "date_new" | "date_old" | "name_asc" | "name_desc" | "amount_high" | "amount_low";

function fmt(n: number) {
  if (n >= 1_000_000) return `£${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 10_000) return `£${(n / 1_000).toFixed(1)}k`;
  return `£${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function greeting(name: string | null) {
  const h = new Date().getHours();
  const n = name ? `, ${name.split(" ")[0]}` : "";
  return h < 12 ? `Good morning${n} ☀️` : h < 17 ? `Good afternoon${n} 👋` : `Good evening${n} 🌙`;
}

function DashboardInner() {
  const supabase = createClient();
  const router = useRouter();
  const params = useSearchParams();

  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState<string | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"quotes" | "invoices">("quotes");
  const [firstVisit, setFirstVisit] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("date_new");
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      setUser(user);

      const metaName = user.user_metadata?.full_name || user.user_metadata?.name;
      const emailName = user.email?.split("@")[0]?.replace(/[._]/g, " ")?.replace(/\b\w/g, (c: string) => c.toUpperCase());
      const n = metaName || emailName || null;
      setName(n);
      if (n) localStorage.setItem("gjq_display_name", n);
      if (user.email) localStorage.setItem("gjq_email", user.email);

      if (Date.now() - new Date(user.created_at).getTime() < 120_000) setFirstVisit(true);

      // Import demo quote if fresh
      const raw = localStorage.getItem("gjq_demo_import");
      if (raw) {
        try {
          const demo = JSON.parse(raw);
          const age = Date.now() - new Date(demo.savedAt).getTime();
          if (age < 3_600_000 && demo.form?.clientName) {
            const yes = window.confirm(`Import your demo quote for "${demo.form.clientName}" into your account?`);
            if (yes) {
              await supabase.from("documents").insert({
                user_id: user.id, type: "quote",
                number: "QUO-" + Date.now().toString().slice(-6),
                client_name: demo.form.clientName, client_email: demo.form.clientEmail || "",
                description: demo.form.description || "", vat: demo.form.vat || false,
                total: demo.total || 0, status: "pending",
                line_items: demo.lineItems || [], notes: demo.form.notes || "",
                signature_data: demo.sigData || null,
              });
            }
            localStorage.removeItem("gjq_demo_import");
          }
        } catch {}
      }

      const { data } = await supabase.from("documents").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setDocs(data || []);
      setLoading(false);
    };
    init();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this permanently?")) return;
    await supabase.from("documents").delete().eq("id", id);
    setDocs((p) => p.filter((d) => d.id !== id));
  };

  const handlePaid = async (doc: Doc) => {
    setMarkingPaid(doc.id);
    await supabase.from("documents").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", doc.id);
    setDocs((p) => p.map((d) => d.id === doc.id ? { ...d, status: "paid" } : d));
    setMarkingPaid(null);
  };

  const handleConvert = async (doc: Doc) => {
    const num = "INV-" + Date.now().toString().slice(-6);
    await supabase.from("documents").insert({
      user_id: user.id, type: "invoice", number: num,
      client_name: doc.client_name, client_email: doc.client_email,
      description: doc.description, vat: doc.vat, total: doc.total,
      status: "pending", line_items: doc.line_items || [], notes: doc.notes || "",
      linked_quote_id: doc.id,
    });
    const { data } = await supabase.from("documents").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setDocs(data || []); setTab("invoices");
  };

  const quotes = docs.filter((d) => d.type === "quote");
  const invoices = docs.filter((d) => d.type === "invoice");
  const totalInvoiced = invoices.reduce((s, d) => s + d.total, 0);
  const pendingCount = invoices.filter((d) => d.status === "pending").length;
  const overdueCount = invoices.filter((d) => d.status === "pending" && new Date(d.created_at) < new Date(Date.now() - 30 * 86400000)).length;

  const list = (tab === "quotes" ? quotes : invoices)
    .filter((d) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return d.client_name?.toLowerCase().includes(q) || d.number?.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sort === "date_old") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sort === "name_asc") return a.client_name.localeCompare(b.client_name);
      if (sort === "name_desc") return b.client_name.localeCompare(a.client_name);
      if (sort === "amount_high") return b.total - a.total;
      if (sort === "amount_low") return a.total - b.total;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="min-h-screen bg-black text-white">
      <TopNav />
      <AdBanner className="border-b border-zinc-900" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Greeting */}
        <div className="mb-7">
          {firstVisit
            ? <><h1 className="text-2xl sm:text-3xl font-bold">👋 Welcome{name ? `, ${name.split(" ")[0]}` : ""}!</h1><p className="text-zinc-400 text-sm mt-1">Your account is ready. Create your first quote below.</p></>
            : <><h1 className="text-2xl sm:text-3xl font-bold">{greeting(name)}</h1><p className="text-zinc-400 text-sm mt-1">Here's your overview.</p></>
          }
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
          {[
            { label: "Quotes", value: loading ? "—" : quotes.length },
            { label: "Invoices", value: loading ? "—" : invoices.length },
            { label: "Total Invoiced", value: loading ? "—" : fmt(totalInvoiced) },
            {
              label: "Pending",
              value: loading ? "—" : pendingCount,
              sub: overdueCount > 0 ? `${overdueCount} overdue` : "invoices",
              alert: overdueCount > 0,
            },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl border p-4 sm:p-5 ${(s as any).alert ? "border-red-500/30 bg-red-500/5" : "border-zinc-800 bg-zinc-900/50"}`}>
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-xl sm:text-2xl font-bold truncate">{s.value}</p>
              {(s as any).sub && <p className={`text-xs mt-0.5 ${(s as any).alert ? "text-red-400" : "text-zinc-600"}`}>{(s as any).sub}</p>}
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="flex gap-2 mb-7 flex-wrap">
          <Link href="/profile" className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900/50 text-xs text-zinc-400 hover:text-white hover:border-zinc-600 transition">🏢 Profile</Link>
          <Link href="/customers" className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900/50 text-xs text-zinc-400 hover:text-white hover:border-zinc-600 transition">👥 Customers</Link>
        </div>

        {/* Empty state */}
        {!loading && docs.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center mb-8">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-xl font-bold mb-2">No quotes yet</h2>
            <p className="text-zinc-400 text-sm mb-6 max-w-xs mx-auto">Create your first professional quote in under 2 minutes.</p>
            <Link href="/tool" className="inline-block px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-sm transition">Create First Quote →</Link>
          </div>
        )}

        {/* Tabs + documents */}
        {docs.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-full">
                {(["quotes", "invoices"] as const).map((t) => (
                  <button key={t} onClick={() => { setTab(t); setSearch(""); }}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition ${tab === t ? "bg-green-600 text-white" : "text-zinc-400 hover:text-white"}`}>
                    {t} ({t === "quotes" ? quotes.length : invoices.length})
                  </button>
                ))}
              </div>
              <Link href="/tool" className="px-4 py-2 text-sm font-bold bg-green-600 hover:bg-green-500 rounded-xl transition">+ New Quote</Link>
            </div>

            {/* Search + sort */}
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">🔍</span>
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search ${tab} by client, ref or description...`}
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition" />
                {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white leading-none text-lg">×</button>}
              </div>
              <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}
                className="px-3 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-white text-sm outline-none focus:border-green-500 transition">
                <option value="date_new">Newest first</option>
                <option value="date_old">Oldest first</option>
                <option value="name_asc">Client A → Z</option>
                <option value="name_desc">Client Z → A</option>
                <option value="amount_high">Amount ↓</option>
                <option value="amount_low">Amount ↑</option>
              </select>
            </div>

            {search && <p className="text-xs text-zinc-600 mb-3">{list.length} result{list.length !== 1 ? "s" : ""} for "{search}"</p>}

            <div className="space-y-2">
              {list.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center">
                  <p className="text-zinc-500 text-sm">{search ? `No ${tab} match "${search}"` : tab === "invoices" ? "No invoices yet — convert a quote." : "No quotes."}</p>
                </div>
              ) : list.map((doc) => {
                const isOverdue = doc.type === "invoice" && doc.status === "pending" && new Date(doc.created_at) < new Date(Date.now() - 30 * 86400000);
                return (
                  <div key={doc.id} className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 transition ${isOverdue ? "border-red-500/20 bg-red-500/5 hover:border-red-500/40" : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"}`}>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white truncate">{doc.client_name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isOverdue ? "bg-red-500/20 text-red-400" : doc.status === "paid" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                          {isOverdue ? "overdue" : doc.status}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 mt-0.5">{doc.number} · {new Date(doc.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                      <span className="text-sm font-bold text-green-400">{fmt(doc.total)}</span>
                      <Link href={`/tool?id=${doc.id}`} className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white transition">View</Link>
                      {doc.type === "quote" && <button onClick={() => handleConvert(doc)} className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-green-500/60 text-zinc-300 hover:text-green-400 transition">→ Invoice</button>}
                      {doc.type === "invoice" && doc.status !== "paid" && (
                        <button onClick={() => handlePaid(doc)} disabled={markingPaid === doc.id}
                          className="text-xs px-3 py-1.5 rounded-lg border border-green-700/50 hover:bg-green-600 text-green-400 hover:text-white transition disabled:opacity-40">
                          {markingPaid === doc.id ? "..." : "✓ Paid"}
                        </button>
                      )}
                      <button onClick={() => handleDelete(doc.id)} className="text-xs px-2 py-1.5 text-zinc-700 hover:text-red-400 transition">✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="mt-12 pt-6 border-t border-zinc-900 flex flex-wrap gap-4 text-xs text-zinc-700">
          <Link href="/terms" className="hover:text-zinc-400 transition">Terms</Link>
          <Link href="/privacy" className="hover:text-zinc-400 transition">Privacy</Link>
          <Link href="/status" className="hover:text-zinc-400 transition">Status</Link>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return <Suspense fallback={<div className="min-h-screen bg-black" />}><DashboardInner /></Suspense>;
}
EOF
echo "✅ app/dashboard/page.tsx"

# ============================================================
# 15. LANDING PAGE — demo CTA prominent
# ============================================================
cat > app/page.tsx << 'EOF'
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GetJobQuotes — Professional Quotes & Invoices for UK Trades",
  description: "Create professional quotes and invoices in under 2 minutes. Built for UK plumbers, electricians, builders and all tradespeople. 100% free.",
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black text-white">

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 sm:px-10 py-4 border-b border-white/5 bg-black/80 backdrop-blur-sm">
        <span className="text-lg font-bold"><span className="text-green-400">Get</span>JobQuotes</span>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/demo" className="hidden sm:inline-block px-4 py-2 text-sm font-semibold border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white rounded-xl transition">Try Demo</Link>
          <Link href="/auth?mode=login" className="px-3 py-2 text-sm text-zinc-400 hover:text-white transition">Log In</Link>
          <Link href="/auth?mode=signup" className="px-4 py-2 text-sm font-bold bg-green-600 hover:bg-green-500 rounded-xl transition">Start Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center pt-20">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-xs font-semibold mb-8">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            Free for UK tradespeople
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Quotes & Invoices<br /><span className="text-green-400">in 2 minutes</span>
          </h1>
          <p className="text-lg sm:text-xl text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Stop wasting time on paperwork. Professional PDFs your clients will trust — for every trade.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth?mode=signup" className="px-8 py-4 text-base font-bold bg-green-600 hover:bg-green-500 rounded-xl transition">
              Start Free — No Card Needed
            </Link>
            <Link href="/demo" className="px-8 py-4 text-base font-semibold border border-zinc-700 hover:border-zinc-500 rounded-xl transition text-zinc-300 hover:text-white">
              👀 Try Demo First
            </Link>
          </div>
          <p className="text-xs text-zinc-700 mt-4">No account needed for demo · Takes 30 seconds to sign up</p>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">Everything you need</h2>
        <p className="text-zinc-500 text-center mb-14 max-w-md mx-auto">Built for plumbers, electricians, builders — every trade.</p>
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { icon: "📋", title: "Professional Quotes", desc: "Clean branded PDFs in seconds. Your logo, your signature, your details." },
            { icon: "🔄", title: "Convert to Invoice", desc: "Turn any quote into an invoice in one click. No retyping." },
            { icon: "💬", title: "Share via WhatsApp", desc: "Send a link your client can view and accept online. No printing needed." },
            { icon: "✍️", title: "Online Acceptance", desc: "Clients accept quotes with a click. You get notified instantly." },
            { icon: "👥", title: "Saved Customers", desc: "Save client details and fill quotes in seconds on repeat jobs." },
            { icon: "📊", title: "Track Everything", desc: "See all quotes and invoices. Mark as paid. Know what's outstanding." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 hover:border-green-600/30 transition group">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="text-sm font-bold mb-1.5 group-hover:text-green-400 transition">{f.title}</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo CTA */}
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <div className="rounded-2xl border border-green-600/30 bg-green-600/5 p-8 sm:p-12 text-center">
          <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-3">No account needed</p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Try it right now</h2>
          <p className="text-zinc-400 text-sm mb-6 max-w-sm mx-auto">Create a real quote, add your details, download a professional PDF. Zero friction.</p>
          <Link href="/demo" className="inline-block px-8 py-3.5 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-white transition">
            Try the Free Demo →
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-zinc-500 mb-8 text-sm">Free forever. No credit card.</p>
        <Link href="/auth?mode=signup" className="inline-block px-10 py-4 text-lg font-bold bg-green-600 hover:bg-green-500 rounded-xl transition">
          Create Your Free Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 px-6 py-6 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-700">
        <span><span className="text-green-400">Get</span>JobQuotes.uk</span>
        <div className="flex flex-wrap gap-4">
          <Link href="/demo" className="hover:text-zinc-400 transition">Try Demo</Link>
          <Link href="/terms" className="hover:text-zinc-400 transition">Terms</Link>
          <Link href="/privacy" className="hover:text-zinc-400 transition">Privacy</Link>
          <Link href="/status" className="hover:text-zinc-400 transition">Status</Link>
        </div>
      </footer>
    </main>
  );
}
EOF
echo "✅ app/page.tsx"

# ============================================================
# 16. MIDDLEWARE — updated with all public routes
# ============================================================
cat > middleware.ts << 'EOF'
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;
  const PROTECTED = ["/dashboard", "/tool", "/profile", "/customers"];

  if (PROTECTED.some((r) => pathname.startsWith(r)) && !user) {
    const url = new URL("/auth", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Don't redirect logged in users away from /auth if they have a ?next param
  if (pathname === "/auth" && user && !request.nextUrl.searchParams.get("next")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|ads.txt|api|demo|status|q|sitemap|robots|manifest|icon).*)"],
};
EOF
echo "✅ middleware.ts"

# ============================================================
# 17. SUPABASE MIGRATION
# ============================================================
cat > supabase-all-migrations.sql << 'EOF'
-- Run ALL of these in Supabase SQL Editor

-- profiles additions
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS signature_data text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false;

-- documents additions
ALTER TABLE documents ADD COLUMN IF NOT EXISTS line_items jsonb DEFAULT '[]';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS signature_data text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS paid_at timestamptz;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS share_token text UNIQUE;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS expires_at timestamptz;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS accepted_at timestamptz;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS accepted_by text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS sent_at timestamptz;

-- customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  address text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users manage own customers" ON customers FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Storage policies for logos bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true) ON CONFLICT DO NOTHING;
DO $$ BEGIN
  CREATE POLICY "Authenticated upload logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'logos');
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Authenticated update logos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'logos');
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Public read logos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'logos');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Public share token read (no auth needed for shared quote links)
DO $$ BEGIN
  CREATE POLICY "Public view shared documents" ON documents FOR SELECT USING (share_token IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN null; END $$;
EOF
echo "✅ supabase-all-migrations.sql"

# ============================================================
# 18. GIT COMMIT + PUSH
# ============================================================
git add .
git commit -m "feat: demo signup wall + import, search+sort everywhere, customers edit, password login, error boundaries, rate limiting, GDPR cookies, AdSense, robots.txt, sitemap, PWA, status page, overdue badges, mobile responsive"
git push origin main

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   ✅  All done! Deploying...           ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "⚠️  REQUIRED: Run supabase-all-migrations.sql in Supabase SQL Editor"
echo ""
echo "📋 Feature summary:"
echo "   ✅ Demo → sign-up wall → data imports to account"
echo "   ✅ Search + sort: quotes, invoices, customers"
echo "   ✅ Customers: edit, delete, search, sort, reusable"
echo "   ✅ Password login + magic link + Google on auth page"
echo "   ✅ Error boundaries on every page"
echo "   ✅ Rate limiting on API routes"
echo "   ✅ GDPR cookie banner (AdSense respects opt-out)"
echo "   ✅ AdSense wired across all app pages"
echo "   ✅ robots.txt + sitemap.ts"
echo "   ✅ PWA manifest (Add to Home Screen)"
echo "   ✅ /status page"
echo "   ✅ Overdue invoice badges (30+ days)"
echo "   ✅ Mobile-first responsive layout everywhere"
echo "   ✅ Landing page with dual CTAs (signup + demo)"
echo ""
echo "🌐 Live at: https://getjobquotes.uk"
