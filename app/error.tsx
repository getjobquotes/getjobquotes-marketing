"use client";
import { useEffect } from "react";
import Link from "next/link";
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl mb-6">⚠️</div>
      <h1 className="text-3xl font-bold mb-2">Something went wrong</h1>
      <p className="text-zinc-400 text-sm mb-8 max-w-sm">An unexpected error occurred. If it keeps happening, let us know at support@getjobquotes.uk</p>
      <div className="flex gap-3">
        <button onClick={reset} className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-semibold text-sm transition">Try Again</button>
        <Link href="/dashboard" className="px-6 py-3 border border-zinc-700 hover:border-zinc-500 rounded-xl font-semibold text-sm transition">Dashboard</Link>
      </div>
    </div>
  );
}
