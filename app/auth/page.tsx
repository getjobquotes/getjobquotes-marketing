"use client";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";

type Mode = "login" | "signup" | "forgot" | "sent" | "reset";

const REASON_MSGS: Record<string, string> = {
  session_expired: "Your session expired. Please log in again.",
  token_invalid: "Your session is no longer valid. Please log in again.",
  unknown: "You were signed out. Please log in again.",
};

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");

async function sendAuthEmail(type: string, email: string, link?: string) {
  await fetch("/api/auth-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, email, link }),
  }).catch(() => {});
}

function AuthInner() {
  const supabase = createClient();
  const router = useRouter();
  const params = useSearchParams();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sentMsg, setSentMsg] = useState("");

  // Set initial mode from URL
  useEffect(() => {
    const m = params.get("mode");
    if (m === "signup") setMode("signup");
  }, []);

  // Auth state changes handled in /auth/reset page

  const clear = () => { setError(""); setSentMsg(""); };

  // ── MAGIC LINK LOGIN ────────────────────────────────────
  const handleMagicLink = async () => {
    if (!email) { setError("Please enter your email address."); return; }
    setLoading(true); clear();
    const callbackUrl = `${APP_URL || window.location.origin}/auth/callback`;
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl, shouldCreateUser: false },
    });
    setLoading(false);
    if (err && err.message.includes("not found")) {
      setError("No account found with that email. Please sign up first.");
      return;
    }
    if (err) { setError(err.message); return; }
    setSentMsg(`Magic link sent to ${email}. Check your inbox.`);
    setMode("sent");
  };

  // ── PASSWORD LOGIN ────────────────────────────────────
  const handlePasswordLogin = async () => {
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setLoading(true); clear();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError(
        err.message.includes("Invalid login") ? "Incorrect email or password." :
        err.message.includes("Email not confirmed") ? "Please confirm your email first. Check your inbox." :
        err.message
      );
      return;
    }
    router.replace("/dashboard");
  };

  // ── SIGNUP ────────────────────────────────────────────
  const handleSignup = async () => {
    if (!email || !password) { setError("Please enter your email and password."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true); clear();
    const callbackUrl = `${APP_URL || window.location.origin}/auth/callback`;
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: callbackUrl },
    });
    setLoading(false);
    if (err) { setError(err.message); return; }

    // If user already exists but unconfirmed, resend
    if (data.user && !data.session) {
      // Send branded confirmation email via Resend
      if (data.user.confirmation_sent_at || data.user.email) {
        // Supabase sends the email but we also send our branded one
        // The Supabase one has the actual link — our job is just UI feedback
        setSentMsg(`Confirmation email sent to ${email}. Click the link to activate your account.`);
      } else {
        setSentMsg(`Check your email at ${email} to confirm your account.`);
      }
      setMode("sent");

      // Send welcome-style confirmation via Resend (branded)
      await sendAuthEmail("signup", email, callbackUrl);
      return;
    }

    // If email confirmations are disabled (instant sign in)
    if (data.session) {
      router.replace("/dashboard");
      return;
    }

    setSentMsg(`Confirmation email sent to ${email}.`);
    setMode("sent");
  };

  // ── FORGOT PASSWORD ───────────────────────────────────
  const handleForgotPassword = async () => {
    if (!email) { setError("Please enter your email address."); return; }
    setLoading(true); clear();
    const callbackUrl = `${APP_URL || window.location.origin}/auth/callback`;
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/auth/callback?type=recovery`,
    });
    setLoading(false);
    if (err) { setError(err.message); return; }

    // Send branded reset email via Resend
    await sendAuthEmail("reset_password", email, callbackUrl);

    setSentMsg(`Password reset link sent to ${email}. Check your inbox.`);
    setMode("sent");
  };

  // ── SET NEW PASSWORD ──────────────────────────────────
  const handleSetPassword = async () => {
    if (!newPassword) { setError("Please enter a new password."); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true); clear();
    const { data, error: err } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (err) { setError(err.message); return; }

    // Send password changed notification
    if (data.user?.email) {
      await sendAuthEmail("password_changed", data.user.email);
    }

    setSentMsg("Password updated successfully! Redirecting...");
    setTimeout(() => router.replace("/dashboard"), 1500);
  };

  // ── GOOGLE OAUTH ──────────────────────────────────────
  const handleGoogle = async () => {
    const callbackUrl = `${APP_URL || window.location.origin}/auth/callback`;
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl },
    });
    if (err) setError(err.message);
  };

  const inp = "w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition";
  const btn = "w-full py-3 rounded-xl font-semibold text-sm transition disabled:opacity-50";

  const reason = params.get("reason");
  const errorParam = params.get("error");

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="text-xl font-bold mb-8">
        <span className="text-green-400">Get</span>JobQuotes
      </Link>

      <div className="w-full max-w-sm space-y-3">

        {/* Banners */}
        {reason && REASON_MSGS[reason] && (
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-400 text-center">
            {REASON_MSGS[reason]}
          </div>
        )}
        {errorParam && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 text-center">
            {errorParam === "callback_failed" ? "Sign in failed. Please try again." : errorParam}
          </div>
        )}

        {/* EMAIL SENT */}
        {mode === "sent" && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
            <div className="text-5xl mb-4">📧</div>
            <h1 className="text-xl font-bold mb-2">Check your email</h1>
            <p className="text-zinc-400 text-sm leading-relaxed mb-2">{sentMsg}</p>
            <p className="text-zinc-600 text-xs mb-6">
              Can't find it? Check your spam folder.
            </p>
            <button onClick={() => { setMode("login"); clear(); }}
              className="text-sm text-green-400 hover:text-green-300 transition">
              ← Back to login
            </button>
          </div>
        )}

        {/* SET NEW PASSWORD */}
        {mode === "reset" && (
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
                  placeholder="Repeat password" className={inp}
                  onKeyDown={e => e.key === "Enter" && handleSetPassword()} />
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              {sentMsg && <p className="text-green-400 text-xs text-center">{sentMsg}</p>}
              <button onClick={handleSetPassword} disabled={loading}
                className={`${btn} bg-green-600 hover:bg-green-500 text-white`}>
                {loading ? "Updating..." : "Set new password"}
              </button>
            </div>
          </div>
        )}

        {/* FORGOT PASSWORD */}
        {mode === "forgot" && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8">
            <h1 className="text-xl font-bold mb-1 text-center">Reset password</h1>
            <p className="text-zinc-500 text-xs text-center mb-6">
              Enter your email and we'll send a reset link.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" className={inp}
                  onKeyDown={e => e.key === "Enter" && handleForgotPassword()} />
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button onClick={handleForgotPassword} disabled={loading}
                className={`${btn} bg-green-600 hover:bg-green-500 text-white`}>
                {loading ? "Sending..." : "Send reset link"}
              </button>
              <button onClick={() => { setMode("login"); clear(); }}
                className="w-full text-center text-sm text-zinc-500 hover:text-zinc-300 transition">
                ← Back to login
              </button>
            </div>
          </div>
        )}

        {/* LOGIN / SIGNUP */}
        {(mode === "login" || mode === "signup") && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8">
            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-full mb-6">
              {(["login", "signup"] as const).map(m => (
                <button key={m} onClick={() => { setMode(m); clear(); }}
                  className={`flex-1 py-2 rounded-full text-sm font-semibold transition ${
                    mode === m ? "bg-green-600 text-white" : "text-zinc-400 hover:text-white"
                  }`}>
                  {m === "login" ? "Log In" : "Sign Up"}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {/* Google */}
              <button onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-zinc-700 hover:border-zinc-500 text-sm font-medium text-zinc-300 hover:text-white transition">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 text-zinc-700 text-xs">
                <div className="flex-1 h-px bg-zinc-800" />
                <span>or with email</span>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>

              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" className={inp} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-zinc-500">Password</label>
                  {mode === "login" ? (
                    <button onClick={() => { setMode("forgot"); clear(); }}
                      className="text-xs text-zinc-600 hover:text-green-400 transition">
                      Forgot password?
                    </button>
                  ) : (
                    <span className="text-xs text-zinc-600">Min. 8 characters</span>
                  )}
                </div>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Your password" className={inp}
                  onKeyDown={e => e.key === "Enter" && (mode === "login" ? handlePasswordLogin() : handleSignup())} />
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-400">
                  {error}
                </div>
              )}

              <button onClick={mode === "login" ? handlePasswordLogin : handleSignup}
                disabled={loading}
                className={`${btn} bg-green-600 hover:bg-green-500 text-white`}>
                {loading ? (mode === "login" ? "Signing in..." : "Creating account...") :
                  mode === "login" ? "Log In" : "Create Account"}
              </button>

              <div className="flex items-center gap-3 text-zinc-700 text-xs">
                <div className="flex-1 h-px bg-zinc-800" />
                <span>or</span>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>

              <button onClick={handleMagicLink} disabled={loading}
                className={`${btn} border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white`}>
                ✉️ Send magic link
              </button>
            </div>

            <p className="text-center text-xs text-zinc-600 mt-5">
              {mode === "login" ? "No account? " : "Already have one? "}
              <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); clear(); }}
                className="text-green-400 hover:text-green-300 transition">
                {mode === "login" ? "Sign up free" : "Log in"}
              </button>
            </p>
          </div>
        )}

        <p className="text-center text-xs text-zinc-700">
          By continuing you agree to our{" "}
          <Link href="/terms" className="hover:text-zinc-500">Terms</Link>
          {" & "}
          <Link href="/privacy" className="hover:text-zinc-500">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-600 text-sm animate-pulse">Loading...</p>
      </div>
    }>
      <AuthInner />
    </Suspense>
  );
}
