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
