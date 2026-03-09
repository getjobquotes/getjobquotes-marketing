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
