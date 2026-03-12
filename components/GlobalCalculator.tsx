"use client";
import { useState } from "react";
import TradeCalculator from "./TradeCalculator";

export default function GlobalCalculator() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating button — always visible */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Trade Calculator"
        className={`fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl border transition-all ${
          open
            ? "bg-zinc-800 border-green-500/50 text-green-400"
            : "bg-zinc-900 border-zinc-700 text-white hover:border-green-500/40 hover:text-green-400"
        }`}>
        <span className="text-lg">🧮</span>
        <span className="text-sm font-semibold hidden sm:inline">Calculator</span>
        {open && <span className="text-xs text-zinc-500 hidden sm:inline">— close</span>}
      </button>

      {/* Drawer — slides in from left on mobile, panel bottom-left on desktop */}
      {open && (
        <>
          {/* Backdrop on mobile */}
          <div
            className="fixed inset-0 z-40 bg-black/60 sm:hidden"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="fixed z-50 bottom-0 left-0 sm:bottom-20 sm:left-6
            w-full sm:w-96
            h-[85vh] sm:h-[580px]
            rounded-t-3xl sm:rounded-3xl
            border border-zinc-800 shadow-2xl overflow-hidden
            flex flex-col">
            <TradeCalculator onClose={() => setOpen(false)} />
          </div>
        </>
      )}
    </>
  );
}
