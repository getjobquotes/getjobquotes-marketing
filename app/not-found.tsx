import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-8xl font-bold text-green-500 mb-4">404</h1>
      <p className="text-xl text-zinc-400 mb-8">Page not found.</p>
      <Link href="/"
        className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-500">
        Go Home
      </Link>
    </div>
  );
}
