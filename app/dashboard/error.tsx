"use client";
import Link from "next/link";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 text-center">
      <p className="text-5xl mb-4">⚠️</p>
      <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
      <div className="flex gap-3 mt-4">
        <button onClick={reset} className="px-5 py-2.5 bg-green-600 hover:bg-green-500 rounded-xl text-sm font-semibold transition">Retry</button>
        <Link href="/dashboard" className="px-5 py-2.5 border border-zinc-700 rounded-xl text-sm text-zinc-300 hover:text-white transition">Dashboard</Link>
      </div>
    </div>
  );
}
