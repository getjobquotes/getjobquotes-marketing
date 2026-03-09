"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-6xl font-bold text-red-500 mb-4">Error</h1>
      <p className="text-xl text-zinc-400 mb-8">Something went wrong.</p>
      <button onClick={reset}
        className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-500">
        Try Again
      </button>
    </div>
  );
}
