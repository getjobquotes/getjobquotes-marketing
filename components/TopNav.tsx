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
