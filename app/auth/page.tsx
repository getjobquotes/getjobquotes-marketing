"use client";

import { createClient } from "@/lib/supabase/client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function AuthForm() {
  const supabase = createClient();
  const params = useSearchParams();
  const router = useRouter();

  const mode = params.get("mode") || "login";

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`;

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        router.push("/dashboard");
      }
    };
    checkSession();
  }, [router, supabase]);

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
      setMessage("Magic login link sent. Check your email.");
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setMessage("");
    await supabase.auth.signOut();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUrl },
    });
    if (error) {
      setLoading(false);
      setMessage(error.message);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-green-600/20 bg-zinc-900 p-8 shadow-2xl">
      <h1 className="mb-6 text-center text-3xl font-bold text-green-500">
        {mode === "signup" ? "Create Account" : "Welcome Back"}
      </h1>

      <input
        type="email"
        placeholder="Enter your email..."
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-4 w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-green-500"
      />

      <button
        onClick={handleEmailAuth}
        disabled={loading || !email}
        className="mb-4 w-full rounded-lg bg-green-600 py-3 font-semibold text-white transition hover:bg-green-500 disabled:opacity-60"
      >
        {loading ? "Please wait..." : mode === "signup" ? "Sign Up with Email" : "Log In with Email"}
      </button>

      {message && (
        <p className="mb-4 text-center text-sm text-green-400">{message}</p>
      )}

      <div className="mb-4 text-center text-zinc-400">OR</div>

      <button
        onClick={handleGoogle}
        disabled={loading}
        className="w-full rounded-lg bg-white py-3 font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-60"
      >
        Continue with Google{" "}
        <span className="text-xs text-zinc-500">(Recommended)</span>
      </button>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white px-6">
      <Suspense fallback={<div className="text-zinc-400">Loading...</div>}>
        <AuthForm />
      </Suspense>
    </div>
  );
}
