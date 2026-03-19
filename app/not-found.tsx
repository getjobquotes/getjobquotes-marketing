import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-6xl font-bold mb-4 text-zinc-800">404</div>
        <h1 className="text-xl font-bold mb-2">Page not found</h1>
        <p className="text-zinc-400 text-sm mb-6">This page does not exist or has been moved.</p>
        <Link href="/"
          className="inline-block px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl text-sm font-bold transition">
          Go Home
        </Link>
      </div>
    </div>
  );
}
