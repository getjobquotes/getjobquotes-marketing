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
  const [initials, setInitials] = useState("?");
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setEmail(user.email || null);
      const name = user.user_metadata?.full_name ||
        user.user_metadata?.name ||
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

  const logout = async () => {
    // Hard logout — clear everything, no further session checks
    try { await supabase.auth.signOut({ scope: "local" }); } catch {}
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith("sb-") || k.includes("supabase"))
        .forEach(k => localStorage.removeItem(k));
    } catch {}
    // Hard redirect — bypasses Next.js router so no auth checks fire
    window.location.href = "/";
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/tool", label: "New Quote" },
    { href: "/customers", label: "Customers" },
    { href: "/profile", label: "Profile" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-900 bg-black/95 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="text-base font-bold shrink-0">
          <span className="text-green-400">Get</span>JobQuotes
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-1">
          {navLinks.filter(l => l.href !== "/settings").map(l => (
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

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button onClick={toggle}
            title="Toggle theme"
            className="w-9 h-9 rounded-xl border border-zinc-800 hover:border-zinc-600 flex items-center justify-center text-zinc-400 hover:text-white transition">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {/* Avatar */}
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
                <div className="py-1 border-b border-zinc-800">
                  {navLinks.map(l => (
                    <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                      className={`block px-4 py-2.5 text-sm transition ${
                        pathname === l.href
                          ? "text-green-400 font-semibold bg-green-600/10"
                          : "text-zinc-300 hover:text-white hover:bg-zinc-900"
                      }`}>
                      {l.label}
                    </Link>
                  ))}
                </div>
                <div className="py-1 border-b border-zinc-800">
                  <button onClick={() => { toggle(); setOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-900 transition">
                    {theme === "dark" ? "☀️ Light mode" : "🌙 Dark mode"}
                  </button>
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
      </div>
    </nav>
  );
}
