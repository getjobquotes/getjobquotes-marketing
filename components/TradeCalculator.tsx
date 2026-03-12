"use client";
import { useState } from "react";

type Tab = "markup" | "vat" | "dayrate" | "materials";

export default function TradeCalculator({ onClose }: { onClose?: () => void }) {
  const [tab, setTab] = useState<Tab>("markup");

  // Markup calculator
  const [cost, setCost] = useState("");
  const [markup, setMarkup] = useState("20");

  // VAT calculator
  const [vatAmount, setVatAmount] = useState("");
  const [vatMode, setVatMode] = useState<"add" | "remove">("add");

  // Day rate calculator
  const [dayRate, setDayRate] = useState("");
  const [days, setDays] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState("8");

  // Materials calculator
  const [matCost, setMatCost] = useState("");
  const [matMarkup, setMatMarkup] = useState("30");
  const [labour, setLabour] = useState("");

  const n = (v: string) => parseFloat(v) || 0;
  const fmt = (v: number) => `£${v.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Markup results
  const sellPrice = n(cost) * (1 + n(markup) / 100);
  const profit = sellPrice - n(cost);

  // VAT results
  const vatResult = vatMode === "add"
    ? { ex: n(vatAmount), vat: n(vatAmount) * 0.2, total: n(vatAmount) * 1.2 }
    : { ex: n(vatAmount) / 1.2, vat: n(vatAmount) - n(vatAmount) / 1.2, total: n(vatAmount) };

  // Day rate results
  const totalDays = n(dayRate) * n(days);
  const hourly = n(dayRate) / n(hoursPerDay || "8");

  // Materials results
  const matSell = n(matCost) * (1 + n(matMarkup) / 100);
  const matProfit = matSell - n(matCost);
  const jobTotal = matSell + n(labour);
  const jobTotalVat = jobTotal * 1.2;

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: "markup", label: "Markup", emoji: "📈" },
    { id: "vat", label: "VAT", emoji: "🧾" },
    { id: "dayrate", label: "Day Rate", emoji: "📅" },
    { id: "materials", label: "Materials", emoji: "🔩" },
  ];

  const inputClass = "w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition";
  const labelClass = "text-xs text-zinc-500 mb-1 block";
  const resultClass = "flex justify-between items-center py-2 border-b border-zinc-800 last:border-0";

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">🧮</span>
          <span className="text-sm font-semibold text-white">Trade Calculator</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-zinc-500 hover:text-white text-xl leading-none transition">×</button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 shrink-0">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 text-xs font-medium transition flex flex-col items-center gap-0.5 ${
              tab === t.id ? "text-green-400 border-b-2 border-green-500" : "text-zinc-500 hover:text-zinc-300"
            }`}>
            <span>{t.emoji}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">

        {/* MARKUP */}
        {tab === "markup" && (
          <>
            <p className="text-xs text-zinc-600">Calculate your sell price with markup.</p>
            <div>
              <label className={labelClass}>Your cost (£)</label>
              <input value={cost} onChange={e => setCost(e.target.value)} type="number" min="0" placeholder="0.00" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Markup (%)</label>
              <div className="flex gap-2">
                <input value={markup} onChange={e => setMarkup(e.target.value)} type="number" min="0" placeholder="20" className={inputClass} />
                <div className="flex gap-1">
                  {["10","20","30","50"].map(v => (
                    <button key={v} onClick={() => setMarkup(v)}
                      className={`px-2 py-1 rounded-lg text-xs transition ${markup === v ? "bg-green-600 text-white" : "border border-zinc-700 text-zinc-400 hover:text-white"}`}>
                      {v}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {n(cost) > 0 && (
              <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 mt-2">
                <div className={resultClass}><span className="text-xs text-zinc-500">Your cost</span><span className="text-sm font-medium">{fmt(n(cost))}</span></div>
                <div className={resultClass}><span className="text-xs text-zinc-500">Markup ({markup}%)</span><span className="text-sm font-medium text-green-400">+{fmt(profit)}</span></div>
                <div className="flex justify-between items-center pt-2"><span className="text-xs font-bold text-zinc-300">Sell price</span><span className="text-base font-bold text-green-400">{fmt(sellPrice)}</span></div>
              </div>
            )}
          </>
        )}

        {/* VAT */}
        {tab === "vat" && (
          <>
            <p className="text-xs text-zinc-600">Add or remove 20% UK VAT.</p>
            <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-full mb-3">
              {[{ v: "add", l: "Add VAT" }, { v: "remove", l: "Remove VAT" }].map(o => (
                <button key={o.v} onClick={() => setVatMode(o.v as any)}
                  className={`flex-1 py-1.5 rounded-full text-xs font-medium transition ${vatMode === o.v ? "bg-green-600 text-white" : "text-zinc-400 hover:text-white"}`}>
                  {o.l}
                </button>
              ))}
            </div>
            <div>
              <label className={labelClass}>{vatMode === "add" ? "Price ex-VAT (£)" : "Price inc-VAT (£)"}</label>
              <input value={vatAmount} onChange={e => setVatAmount(e.target.value)} type="number" min="0" placeholder="0.00" className={inputClass} />
            </div>
            {n(vatAmount) > 0 && (
              <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 mt-2">
                <div className={resultClass}><span className="text-xs text-zinc-500">Ex-VAT</span><span className="text-sm font-medium">{fmt(vatResult.ex)}</span></div>
                <div className={resultClass}><span className="text-xs text-zinc-500">VAT (20%)</span><span className="text-sm font-medium text-yellow-400">{fmt(vatResult.vat)}</span></div>
                <div className="flex justify-between items-center pt-2"><span className="text-xs font-bold text-zinc-300">Inc-VAT</span><span className="text-base font-bold text-green-400">{fmt(vatResult.total)}</span></div>
              </div>
            )}
          </>
        )}

        {/* DAY RATE */}
        {tab === "dayrate" && (
          <>
            <p className="text-xs text-zinc-600">Work out job cost from day rate.</p>
            <div>
              <label className={labelClass}>Day rate (£)</label>
              <input value={dayRate} onChange={e => setDayRate(e.target.value)} type="number" min="0" placeholder="0.00" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Number of days</label>
              <input value={days} onChange={e => setDays(e.target.value)} type="number" min="0" step="0.5" placeholder="1" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Hours per day</label>
              <div className="flex gap-1">
                {["6","7","8","10"].map(v => (
                  <button key={v} onClick={() => setHoursPerDay(v)}
                    className={`flex-1 py-2 rounded-xl text-xs transition ${hoursPerDay === v ? "bg-green-600 text-white" : "border border-zinc-700 text-zinc-400 hover:text-white"}`}>
                    {v}h
                  </button>
                ))}
              </div>
            </div>
            {n(dayRate) > 0 && (
              <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 mt-2">
                <div className={resultClass}><span className="text-xs text-zinc-500">Hourly rate</span><span className="text-sm font-medium">{fmt(hourly)}/hr</span></div>
                <div className={resultClass}><span className="text-xs text-zinc-500">Day rate</span><span className="text-sm font-medium">{fmt(n(dayRate))}/day</span></div>
                {n(days) > 0 && <>
                  <div className={resultClass}><span className="text-xs text-zinc-500">Total ({days} days)</span><span className="text-sm font-medium">{fmt(totalDays)}</span></div>
                  <div className="flex justify-between items-center pt-2"><span className="text-xs font-bold text-zinc-300">Inc VAT</span><span className="text-base font-bold text-green-400">{fmt(totalDays * 1.2)}</span></div>
                </>}
              </div>
            )}
          </>
        )}

        {/* MATERIALS */}
        {tab === "materials" && (
          <>
            <p className="text-xs text-zinc-600">Full job cost — materials + labour.</p>
            <div>
              <label className={labelClass}>Materials cost (£)</label>
              <input value={matCost} onChange={e => setMatCost(e.target.value)} type="number" min="0" placeholder="0.00" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Materials markup (%)</label>
              <div className="flex gap-1">
                {["15","20","25","30"].map(v => (
                  <button key={v} onClick={() => setMatMarkup(v)}
                    className={`flex-1 py-2 rounded-xl text-xs transition ${matMarkup === v ? "bg-green-600 text-white" : "border border-zinc-700 text-zinc-400 hover:text-white"}`}>
                    {v}%
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Labour cost (£)</label>
              <input value={labour} onChange={e => setLabour(e.target.value)} type="number" min="0" placeholder="0.00" className={inputClass} />
            </div>
            {(n(matCost) > 0 || n(labour) > 0) && (
              <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 mt-2">
                <div className={resultClass}><span className="text-xs text-zinc-500">Materials (cost)</span><span className="text-sm">{fmt(n(matCost))}</span></div>
                <div className={resultClass}><span className="text-xs text-zinc-500">Materials (sell +{matMarkup}%)</span><span className="text-sm text-green-400">{fmt(matSell)}</span></div>
                <div className={resultClass}><span className="text-xs text-zinc-500">Mat. profit</span><span className="text-sm text-green-400">+{fmt(matProfit)}</span></div>
                {n(labour) > 0 && <div className={resultClass}><span className="text-xs text-zinc-500">Labour</span><span className="text-sm">{fmt(n(labour))}</span></div>}
                <div className={resultClass}><span className="text-xs font-bold text-zinc-300">Job total (ex VAT)</span><span className="text-sm font-bold">{fmt(jobTotal)}</span></div>
                <div className="flex justify-between items-center pt-2"><span className="text-xs font-bold text-zinc-300">Job total (inc VAT)</span><span className="text-base font-bold text-green-400">{fmt(jobTotalVat)}</span></div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
