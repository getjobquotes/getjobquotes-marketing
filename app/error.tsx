"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => { console.error("Global error:", error); }, [error]);
  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--text))] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
        <p className="text-[rgb(var(--text-muted))] text-sm mb-6">An unexpected error occurred. Your data is safe.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset}
            className="px-4 py-2.5 bg-green-600 hover:bg-green-500 rounded-xl text-sm font-bold transition">
            Try Again
          </button>
          <Link href="/dashboard"
            className="px-4 py-2.5 border border-[rgb(var(--border-strong))] rounded-xl text-sm text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] transition">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
