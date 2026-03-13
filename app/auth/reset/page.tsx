"use client";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    // Also check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async () => {
    if (!newPassword) { setError("Please enter a new password."); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true); setError("");
    const { data, error: err } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (err) { setError(err.message); return; }
    if (data.user?.email) {
      fetch("/api/auth-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "password_changed", email: data.user.email }),
      }).catch(() => {});
    }
    setSuccess(true);
    setTimeout(() => router.replace("/dashboard"), 2000);
  };

  const inp = "w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition";

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="text-xl font-bold mb-8">
        <span className="text-green-400">Get</span>JobQuotes
      </Link>
      <div className="w-full max-w-sm">
        {success ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-xl font-bold mb-2">Password updated!</h1>
            <p className="text-zinc-400 text-sm">Taking you to your dashboard...</p>
          </div>
        ) : !ready ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
            <div className="text-5xl mb-4">🔐</div>
            <h1 className="text-xl font-bold mb-2">Verifying reset link...</h1>
            <p className="text-zinc-400 text-sm mb-4">If this takes too long, your link may have expired.</p>
            <Link href="/auth" className="text-sm text-green-400 hover:text-green-300 transition">
              Request a new reset link
            </Link>
          </div>
        ) : (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8">
            <h1 className="text-xl font-bold mb-1 text-center">Set new password</h1>
            <p className="text-zinc-500 text-xs text-center mb-6">Choose a strong password.</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">New password</label>
                <input type="password" value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters" className={inp} />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Confirm password</label>
                <input type="password" value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password" className={inp}
                  onKeyDown={e => e.key === "Enter" && handleReset()} />
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button onClick={handleReset} disabled={loading}
                className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition disabled:opacity-50">
                {loading ? "Updating..." : "Set New Password"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
