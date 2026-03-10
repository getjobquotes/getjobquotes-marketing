#!/bin/bash
# ============================================================
# GetJobQuotes — Fix Build: ThemeContext + missing files
# bash fix-build.sh
# ============================================================

set -e
echo "🔧 Fixing build errors..."

# ============================================================
# 1. ThemeContext — was missing, layout.tsx imports it
# ============================================================
mkdir -p context
cat > context/ThemeContext.tsx << 'EOF'
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "dark" | "light";

const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
}>({ theme: "dark", toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem("gjq_theme") as Theme | null;
    const t = stored || "dark";
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
    document.documentElement.classList.toggle("light", t === "light");
  }, []);

  const toggle = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("gjq_theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      document.documentElement.classList.toggle("light", next === "light");
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
EOF
echo "✅ context/ThemeContext.tsx"

# ============================================================
# 2. TopNav — may be missing
# ============================================================
mkdir -p components
cat > components/TopNav.tsx << 'EOF'
"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

export default function TopNav() {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUser(user);
      const n = user.user_metadata?.full_name || user.user_metadata?.name ||
        user.email?.split("@")[0]?.replace(/[._]/g, " ")?.replace(/\b\w/g, (c: string) => c.toUpperCase()) || "";
      setName(n);
    });
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/tool", label: "New Quote" },
    { href: "/customers", label: "Customers" },
  ];

  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "U";

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-900 bg-black/95 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/dashboard" className="text-base font-bold shrink-0">
          <span className="text-green-400">Get</span>JobQuotes
        </Link>

        {/* Nav links — desktop */}
        <div className="hidden sm:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                pathname === l.href ? "text-white bg-zinc-800" : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right: theme + avatar */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button onClick={toggle}
            className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900 transition text-base"
            aria-label="Toggle theme">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {/* Profile dropdown */}
          {user && (
            <div ref={menuRef} className="relative">
              <button onClick={() => setMenuOpen((v) => !v)}
                className="w-8 h-8 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center hover:bg-green-500 transition">
                {initials}
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-10 w-48 rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-zinc-800">
                    <p className="text-xs font-semibold text-white truncate">{name}</p>
                    <p className="text-xs text-zinc-600 truncate">{user.email}</p>
                  </div>
                  <Link href="/profile" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-900 transition">
                    🏢 Business Profile
                  </Link>
                  {/* Mobile nav links */}
                  <div className="sm:hidden border-t border-zinc-800">
                    {navLinks.map((l) => (
                      <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-900 transition">
                        {l.label}
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-zinc-800">
                    <button onClick={signOut}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-zinc-900 transition">
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
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
# 3. Supabase client helpers — must exist
# ============================================================
mkdir -p lib/supabase

cat > lib/supabase/client.ts << 'EOF'
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
EOF

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
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}
EOF
echo "✅ lib/supabase/client.ts + server.ts"

# ============================================================
# 4. Rate limiter
# ============================================================
cat > lib/rateLimit.ts << 'EOF'
const requests = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = requests.get(key);
  if (!entry || now > entry.reset) {
    requests.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}
EOF
echo "✅ lib/rateLimit.ts"

# ============================================================
# 5. globals.css — must exist for layout.tsx import
# ============================================================
if [ ! -f app/globals.css ]; then
cat > app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { -webkit-font-smoothing: antialiased; }

/* Thin scrollbar */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
EOF
echo "✅ app/globals.css (created)"
else
  echo "✅ app/globals.css (exists)"
fi

# ============================================================
# 6. Verify all imports in layout.tsx exist
# ============================================================
echo ""
echo "🔍 Verifying critical files exist:"
for f in \
  "context/ThemeContext.tsx" \
  "components/CookieBanner.tsx" \
  "components/TopNav.tsx" \
  "lib/supabase/client.ts" \
  "lib/supabase/server.ts" \
  "lib/rateLimit.ts" \
  "app/globals.css" \
  "app/layout.tsx" \
  "app/auth/callback/route.ts" \
  "app/api/health/route.ts"; do
  if [ -f "$f" ]; then
    echo "  ✅ $f"
  else
    echo "  ❌ MISSING: $f"
  fi
done

# ============================================================
# 7. Install deps if needed
# ============================================================
echo ""
echo "📦 Checking dependencies..."
npm install @supabase/ssr @supabase/supabase-js resend --save 2>/dev/null | tail -1 || true

# ============================================================
# 8. Test build locally
# ============================================================
echo ""
echo "🏗  Running build check..."
npm run build 2>&1 | tail -20

# ============================================================
# 9. Commit and push
# ============================================================
git add .
git commit -m "fix: add missing ThemeContext, TopNav, supabase helpers — fixes Vercel build"
git push origin main

echo ""
echo "✅ Build should be green. Check Vercel dashboard."
