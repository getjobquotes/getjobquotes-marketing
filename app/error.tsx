'use client';
import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Global error:", error); }, [error]);
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
        <p className="text-zinc-400 text-sm mb-6">
          An unexpected error occurred. Your data is safe.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset}
            className="px-4 py-2.5 bg-green-600 hover:bg-green-500 rounded-xl text-sm font-bold transition">
            Try Again
          </button>
          <Link href="/dashboard"
            className="px-4 py-2.5 border border-zinc-700 rounded-xl text-sm text-zinc-400 hover:text-white transition">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
