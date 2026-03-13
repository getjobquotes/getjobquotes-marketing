"use client";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/context/ThemeContext";
import { useState } from "react";
import TopNav from "@/components/TopNav";
import Link from "next/link";

export default function SettingsPage() {
  const auth = useAuthGuard();
  const { theme, toggle } = useTheme();
  const supabase = createClient();
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");

  const handleChangePw = async () => {
    if (newPw.length < 8) { setPwErr("Min 8 characters."); return; }
    if (newPw !== confirmPw) { setPwErr("Passwords don't match."); return; }
    setPwLoading(true); setPwErr(""); setPwMsg("");
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setPwLoading(false);
    if (error) { setPwErr(error.message); return; }
    setPwMsg("Password updated ✅");
    setNewPw(""); setConfirmPw("");
  };

  if (auth.status === "loading") return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-zinc-600 text-sm animate-pulse">Loading...</p>
    </div>
  );
  if (auth.status === "unauthenticated") return null;

  const inp = "w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition";

  return (
    <div className="min-h-screen bg-black text-white">
      <TopNav />
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage your preferences.</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Appearance</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-zinc-500 mt-0.5">{theme === "dark" ? "🌙 Dark mode" : "☀️ Light mode"}</p>
            </div>
            <button onClick={toggle}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-700 hover:border-green-500/50 text-sm font-medium text-zinc-300 hover:text-white transition">
              {theme === "dark" ? "☀️ Switch to Light" : "🌙 Switch to Dark"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Account</h2>
          <p className="text-xs text-zinc-500 mb-1">Logged in as</p>
          <p className="text-sm font-medium mb-4">{auth.user?.email}</p>
          <Link href="/profile" className="inline-block px-4 py-2.5 rounded-xl border border-zinc-700 hover:border-zinc-500 text-sm text-zinc-300 hover:text-white transition">
            Edit Business Profile →
          </Link>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Change Password</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">New password</label>
              <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min 8 characters" className={inp} />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Confirm password</label>
              <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Repeat password" className={inp}
                onKeyDown={e => e.key === "Enter" && handleChangePw()} />
            </div>
            {pwErr && <p className="text-red-400 text-xs">{pwErr}</p>}
            {pwMsg && <p className="text-green-400 text-xs">{pwMsg}</p>}
            <button onClick={handleChangePw} disabled={pwLoading}
              className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition disabled:opacity-50">
              {pwLoading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-red-900/30 bg-red-500/5 p-6">
          <h2 className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-3">Sign Out</h2>
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500">Sign out of this device.</p>
            <button onClick={async () => {
              try { await supabase.auth.signOut({ scope: "local" }); } catch {}
              try {
                Object.keys(localStorage)
                  .filter(k => k.startsWith("sb-") || k.includes("supabase"))
                  .forEach(k => localStorage.removeItem(k));
              } catch {}
              window.location.href = "/";
            }}
              className="px-4 py-2.5 rounded-xl border border-red-800/50 hover:bg-red-600 text-sm text-red-400 hover:text-white transition">
              Sign Out
            </button>
          </div>
        </div>

        <Link href="/dashboard" className="block text-xs text-zinc-600 hover:text-zinc-400 transition">← Back to Dashboard</Link>
      </div>
    </div>
  );
}
