import Link from "next/link";
export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 text-center">
      <div className="text-7xl font-bold text-zinc-900 mb-4 select-none">404</div>
      <h1 className="text-2xl font-bold mb-2">Page not found</h1>
      <p className="text-zinc-400 text-sm mb-8">This page doesn't exist or has been moved.</p>
      <div className="flex gap-3">
        <Link href="/" className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-semibold text-sm transition">Home</Link>
        <Link href="/dashboard" className="px-6 py-3 border border-zinc-700 hover:border-zinc-500 rounded-xl font-semibold text-sm transition">Dashboard</Link>
      </div>
    </div>
  );
}
