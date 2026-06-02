"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("gjq_cookie_consent");
    if (!consent) setTimeout(() => setShow(true), 1500);
  }, []);

  const accept = () => { localStorage.setItem("gjq_cookie_consent", "all"); setShow(false); };
  const essential = () => { localStorage.setItem("gjq_cookie_consent", "essential"); setShow(false); };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-[420px] z-[100] rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-5 shadow-2xl animate-in slide-in-from-bottom-4">
      <p className="text-sm font-semibold text-[rgb(var(--text))] mb-1">🍪 Cookie Preferences</p>
      <p className="text-xs text-[rgb(var(--text-muted))] leading-relaxed mb-4">
        We use essential cookies to keep you logged in, and analytics cookies (Google Analytics) to improve the product.
        See our <Link href="/privacy" className="text-green-400 hover:underline">Privacy Policy</Link>.
      </p>
      <div className="flex gap-2">
        <button onClick={accept}
          className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-[rgb(var(--text))] text-xs font-bold transition">
          Accept All
        </button>
        <button onClick={essential}
          className="flex-1 py-2.5 rounded-xl border border-[rgb(var(--border-strong))] hover:border-[rgb(var(--border-strong))] text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] text-xs font-semibold transition">
          Essential Only
        </button>
      </div>
    </div>
  );
}
