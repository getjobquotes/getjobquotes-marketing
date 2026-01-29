export default function ThanksPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <h1 className="text-4xl font-semibold tracking-tight">You&apos;re in ✅</h1>
        <p className="mt-4 text-lg text-gray-600">
          Thanks for joining early access. Check your inbox for a confirmation email (and your spam folder just in case).
        </p>

        <div className="mt-8">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border px-5 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Back to home
          </a>
        </div>
      </div>
    </main>
  );
}

