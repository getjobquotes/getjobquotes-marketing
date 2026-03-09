import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      
      <nav className="flex items-center justify-between border-b border-green-600/20 p-6">
        <h1 className="text-2xl font-bold text-green-500">
          GetJobQuotes.app
        </h1>

        <div className="flex gap-4">
          <Link
            href="/auth?mode=login"
            className="text-white hover:text-green-400"
          >
            Log In
          </Link>

          <Link
            href="/auth?mode=signup"
            className="rounded-lg bg-green-600 px-5 py-2 font-semibold text-white hover:bg-green-500"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      <main className="flex flex-1 items-center px-8">
        <div className="mx-auto max-w-4xl text-center">
          
          <h2 className="mb-6 text-5xl font-bold leading-tight">
            Create Professional Quotes & Invoices
          </h2>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-zinc-400">
            Built for UK trades. Generate clean, professional documents in under 2 minutes.
          </p>

          <div className="flex justify-center gap-4">

            <Link
              href="/auth?mode=signup"
              className="rounded-lg bg-green-600 px-8 py-3 text-lg font-semibold text-white hover:bg-green-500"
            >
              Start Free
            </Link>

            <Link
              href="/auth?mode=login"
              className="rounded-lg border border-green-500 px-8 py-3 text-lg font-semibold text-green-400 hover:bg-green-500 hover:text-black"
            >
              Log In
            </Link>

          </div>

        </div>
      </main>

    </div>
  );
}
