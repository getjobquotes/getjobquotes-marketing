"use client";
import { useState, useEffect } from "react";

type Tab = "calc" | "markup" | "vat" | "dayrate" | "materials";

type HistoryEntry = {
  id: string;
  tab: Tab;
  label: string;
  result: string;
  timestamp: number;
};

const STORAGE_KEY = "gjq_calc_history";
const MAX_HISTORY = 20;

function saveHistory(entry: Omit<HistoryEntry, "id" | "timestamp">) {
  try {
    const existing: HistoryEntry[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const newEntry: HistoryEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    const updated = [newEntry, ...existing].slice(0, MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch { return []; }
}

function loadHistory(): HistoryEntry[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

const n = (v: string) => parseFloat(v) || 0;
const fmt = (v: number) => `£${v.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const timeAgo = (ts: number) => {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

export default function TradeCalculator({ onClose }: { onClose?: () => void }) {
  const [tab, setTab] = useState<Tab>("markup");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Standard calculator
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState<string | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [waitNext, setWaitNext] = useState(false);

  const calcInput = (val: string) => {
    if (waitNext) { setDisplay(val); setWaitNext(false); return; }
    setDisplay(display === "0" ? val : display + val);
  };
  const calcOp = (o: string) => {
    setPrev(display); setOp(o); setWaitNext(true);
  };
  const calcEquals = () => {
    if (!prev || !op) return;
    const a = parseFloat(prev), b = parseFloat(display);
    let r = 0;
    if (op === "+") r = a + b;
    else if (op === "-") r = a - b;
    else if (op === "×") r = a * b;
    else if (op === "÷") r = b !== 0 ? a / b : 0;
    const res = parseFloat(r.toFixed(10)).toString();
    setDisplay(res); setPrev(null); setOp(null); setWaitNext(true);
  };
  const calcClear = () => { setDisplay("0"); setPrev(null); setOp(null); setWaitNext(false); };
  const calcPercent = () => setDisplay((parseFloat(display) / 100).toString());
  const calcToggle = () => setDisplay((parseFloat(display) * -1).toString());
  const calcDot = () => { if (!display.includes(".")) setDisplay(display + "."); };

  // Markup
  const [cost, setCost] = useState("");
  const [markup, setMarkup] = useState("20");
  // VAT
  const [vatAmount, setVatAmount] = useState("");
  const [vatMode, setVatMode] = useState<"add" | "remove">("add");
  // Day rate
  const [dayRate, setDayRate] = useState("");
  const [days, setDays] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState("8");
  // Materials
  const [matCost, setMatCost] = useState("");
  const [matMarkup, setMatMarkup] = useState("30");
  const [labour, setLabour] = useState("");

  // Load history and saved calc state on mount
  useEffect(() => {
    setHistory(loadHistory());
    try {
      const saved = JSON.parse(localStorage.getItem("gjq_calc_state") || "{}");
      if (saved.tab) setTab(saved.tab);
      if (saved.cost) setCost(saved.cost);
      if (saved.markup) setMarkup(saved.markup);
      if (saved.vatAmount) setVatAmount(saved.vatAmount);
      if (saved.vatMode) setVatMode(saved.vatMode);
      if (saved.dayRate) setDayRate(saved.dayRate);
      if (saved.days) setDays(saved.days);
      if (saved.hoursPerDay) setHoursPerDay(saved.hoursPerDay);
      if (saved.matCost) setMatCost(saved.matCost);
      if (saved.matMarkup) setMatMarkup(saved.matMarkup);
      if (saved.labour) setLabour(saved.labour);
    } catch {}
  }, []);

  // Save calc state on every change
  useEffect(() => {
    try {
      localStorage.setItem("gjq_calc_state", JSON.stringify({
        tab, cost, markup, vatAmount, vatMode, dayRate, days, hoursPerDay, matCost, matMarkup, labour
      }));
    } catch {}
  }, [tab, cost, markup, vatAmount, vatMode, dayRate, days, hoursPerDay, matCost, matMarkup, labour]);

  // Results
  const sellPrice = n(cost) * (1 + n(markup) / 100);
  const profit = sellPrice - n(cost);
  const vatResult = vatMode === "add"
    ? { ex: n(vatAmount), vat: n(vatAmount) * 0.2, total: n(vatAmount) * 1.2 }
    : { ex: n(vatAmount) / 1.2, vat: n(vatAmount) - n(vatAmount) / 1.2, total: n(vatAmount) };
  const totalDayRate = n(dayRate) * n(days);
  const hourly = n(dayRate) / n(hoursPerDay || "8");
  const matSell = n(matCost) * (1 + n(matMarkup) / 100);
  const matProfit = matSell - n(matCost);
  const jobTotal = matSell + n(labour);

  const handleSave = () => {
    let label = "", result = "";
    if (tab === "markup" && n(cost) > 0) { label = `${fmt(n(cost))} + ${markup}%`; result = `Sell: ${fmt(sellPrice)}`; }
    else if (tab === "vat" && n(vatAmount) > 0) { label = `${vatMode === "add" ? "Add" : "Remove"} VAT on ${fmt(n(vatAmount))}`; result = `Total: ${fmt(vatResult.total)}`; }
    else if (tab === "dayrate" && n(dayRate) > 0) { label = `${fmt(n(dayRate))}/day × ${days || 1} days`; result = `Total: ${fmt(totalDayRate)}`; }
    else if (tab === "materials" && n(matCost) > 0) { label = `Mat ${fmt(n(matCost))} + Labour ${fmt(n(labour))}`; result = `Job: ${fmt(jobTotal)}`; }
    else return;
    const updated = saveHistory({ tab, label, result });
    setHistory(updated);
  };

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  };

  const inputCls = "w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition";
  const labelCls = "text-xs text-zinc-500 mb-1 block";
  const rowCls = "flex justify-between items-center py-2 border-b border-zinc-800 last:border-0";

  const tabs: { id: Tab; emoji: string; label: string }[] = [
    { id: "calc", emoji: "🔢", label: "Calc" },
    { id: "markup", emoji: "📈", label: "Markup" },
    { id: "vat", emoji: "🧾", label: "VAT" },
    { id: "dayrate", emoji: "📅", label: "Day Rate" },
    { id: "materials", emoji: "🔩", label: "Materials" },
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-950 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-base">🧮</span>
          <span className="text-sm font-semibold text-white">Trade Calculator</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(v => !v)}
            className={`text-xs px-2 py-1 rounded-lg transition ${showHistory ? "bg-green-600/20 text-green-400" : "text-zinc-500 hover:text-white border border-zinc-800"}`}>
            {history.length > 0 ? `📋 ${history.length}` : "📋"}
          </button>
          {onClose && (
            <button onClick={onClose} className="text-zinc-500 hover:text-white text-xl leading-none transition w-6 h-6 flex items-center justify-center">×</button>
          )}
        </div>
      </div>

      {/* History panel */}
      {showHistory && (
        <div className="border-b border-zinc-800 bg-zinc-900/50 shrink-0 max-h-48 overflow-y-auto">
          {history.length === 0 ? (
            <p className="text-xs text-zinc-600 text-center py-4">No saved calculations yet</p>
          ) : (
            <>
              <div className="flex justify-between items-center px-4 py-2">
                <span className="text-xs text-zinc-500 font-medium">Recent calculations</span>
                <button onClick={clearHistory} className="text-xs text-zinc-700 hover:text-red-400 transition">Clear all</button>
              </div>
              {history.map(h => (
                <div key={h.id} className="flex items-start justify-between px-4 py-2 hover:bg-zinc-900 transition border-t border-zinc-800/50">
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-300 truncate">{h.label}</p>
                    <p className="text-xs text-green-400 font-medium">{h.result}</p>
                  </div>
                  <span className="text-xs text-zinc-700 shrink-0 ml-2">{timeAgo(h.timestamp)}</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 shrink-0">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 text-xs font-medium transition flex flex-col items-center gap-0.5 ${
              tab === t.id ? "text-green-400 border-b-2 border-green-500 bg-green-500/5" : "text-zinc-500 hover:text-zinc-300"
            }`}>
            <span>{t.emoji}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Calculator content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">

        {/* STANDARD CALCULATOR */}
        {tab === "calc" && (
          <div className="flex flex-col gap-2">
            {/* Display */}
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 px-4 py-4 text-right">
              {op && prev && (
                <p className="text-xs text-zinc-600 mb-1">{prev} {op}</p>
              )}
              <p className="text-3xl font-bold text-white truncate">{display}</p>
            </div>
            {/* Buttons */}
            {[
              [
                { label: "AC", action: calcClear, style: "bg-zinc-700 hover:bg-zinc-600 text-white" },
                { label: "+/-", action: calcToggle, style: "bg-zinc-700 hover:bg-zinc-600 text-white" },
                { label: "%", action: calcPercent, style: "bg-zinc-700 hover:bg-zinc-600 text-white" },
                { label: "÷", action: () => calcOp("÷"), style: "bg-green-600 hover:bg-green-500 text-white" },
              ],
              [
                { label: "7", action: () => calcInput("7"), style: "bg-zinc-800 hover:bg-zinc-700 text-white" },
                { label: "8", action: () => calcInput("8"), style: "bg-zinc-800 hover:bg-zinc-700 text-white" },
                { label: "9", action: () => calcInput("9"), style: "bg-zinc-800 hover:bg-zinc-700 text-white" },
                { label: "×", action: () => calcOp("×"), style: "bg-green-600 hover:bg-green-500 text-white" },
              ],
              [
                { label: "4", action: () => calcInput("4"), style: "bg-zinc-800 hover:bg-zinc-700 text-white" },
                { label: "5", action: () => calcInput("5"), style: "bg-zinc-800 hover:bg-zinc-700 text-white" },
                { label: "6", action: () => calcInput("6"), style: "bg-zinc-800 hover:bg-zinc-700 text-white" },
                { label: "-", action: () => calcOp("-"), style: "bg-green-600 hover:bg-green-500 text-white" },
              ],
              [
                { label: "1", action: () => calcInput("1"), style: "bg-zinc-800 hover:bg-zinc-700 text-white" },
                { label: "2", action: () => calcInput("2"), style: "bg-zinc-800 hover:bg-zinc-700 text-white" },
                { label: "3", action: () => calcInput("3"), style: "bg-zinc-800 hover:bg-zinc-700 text-white" },
                { label: "+", action: () => calcOp("+"), style: "bg-green-600 hover:bg-green-500 text-white" },
              ],
              [
                { label: "0", action: () => calcInput("0"), style: "bg-zinc-800 hover:bg-zinc-700 text-white col-span-2" },
                { label: ".", action: calcDot, style: "bg-zinc-800 hover:bg-zinc-700 text-white" },
                { label: "=", action: calcEquals, style: "bg-green-600 hover:bg-green-500 text-white" },
              ],
            ].map((row, ri) => (
              <div key={ri} className="grid grid-cols-4 gap-2">
                {row.map((btn, bi) => (
                  <button
                    key={bi}
                    onClick={btn.action}
                    className={`${btn.style} ${(btn.style as string).includes("col-span-2") ? "col-span-2" : ""} rounded-2xl py-4 text-lg font-semibold transition active:scale-95`}>
                    {btn.label}
                  </button>
                ))}
              </div>
            ))}
            {/* Use result in trade calcs */}
            {display !== "0" && (
              <div className="flex gap-2 pt-1">
                <button onClick={() => { setCost(display); setTab("markup"); }}
                  className="flex-1 py-2 rounded-xl border border-zinc-700 text-xs text-zinc-400 hover:text-white hover:border-zinc-500 transition">
                  Use in Markup →
                </button>
                <button onClick={() => { setVatAmount(display); setTab("vat"); }}
                  className="flex-1 py-2 rounded-xl border border-zinc-700 text-xs text-zinc-400 hover:text-white hover:border-zinc-500 transition">
                  Use in VAT →
                </button>
              </div>
            )}
          </div>
        )}

        {/* MARKUP */}
        {tab === "markup" && <>
          <p className="text-xs text-zinc-600">Your cost + markup % = sell price.</p>
          <div>
            <label className={labelCls}>Your cost (£)</label>
            <input value={cost} onChange={e => setCost(e.target.value)} type="number" min="0" placeholder="0.00" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Markup (%)</label>
            <div className="flex gap-2">
              <input value={markup} onChange={e => setMarkup(e.target.value)} type="number" min="0" placeholder="20" className={inputCls} />
              <div className="flex gap-1 shrink-0">
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
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
              <div className={rowCls}><span className="text-xs text-zinc-500">Your cost</span><span className="text-sm">{fmt(n(cost))}</span></div>
              <div className={rowCls}><span className="text-xs text-zinc-500">Profit ({markup}%)</span><span className="text-sm text-green-400">+{fmt(profit)}</span></div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs font-bold text-zinc-300">Sell price</span>
                <span className="text-base font-bold text-green-400">{fmt(sellPrice)}</span>
              </div>
            </div>
          )}
        </>}

        {/* VAT */}
        {tab === "vat" && <>
          <p className="text-xs text-zinc-600">Add or remove UK 20% VAT.</p>
          <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-full">
            {[{ v: "add", l: "Add VAT" }, { v: "remove", l: "Remove VAT" }].map(o => (
              <button key={o.v} onClick={() => setVatMode(o.v as any)}
                className={`flex-1 py-1.5 rounded-full text-xs font-medium transition ${vatMode === o.v ? "bg-green-600 text-white" : "text-zinc-400 hover:text-white"}`}>
                {o.l}
              </button>
            ))}
          </div>
          <div>
            <label className={labelCls}>{vatMode === "add" ? "Price ex-VAT (£)" : "Price inc-VAT (£)"}</label>
            <input value={vatAmount} onChange={e => setVatAmount(e.target.value)} type="number" min="0" placeholder="0.00" className={inputCls} />
          </div>
          {n(vatAmount) > 0 && (
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
              <div className={rowCls}><span className="text-xs text-zinc-500">Ex-VAT</span><span className="text-sm">{fmt(vatResult.ex)}</span></div>
              <div className={rowCls}><span className="text-xs text-zinc-500">VAT (20%)</span><span className="text-sm text-yellow-400">{fmt(vatResult.vat)}</span></div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs font-bold text-zinc-300">Inc-VAT</span>
                <span className="text-base font-bold text-green-400">{fmt(vatResult.total)}</span>
              </div>
            </div>
          )}
        </>}

        {/* DAY RATE */}
        {tab === "dayrate" && <>
          <p className="text-xs text-zinc-600">Work out job cost from your day rate.</p>
          <div>
            <label className={labelCls}>Day rate (£)</label>
            <input value={dayRate} onChange={e => setDayRate(e.target.value)} type="number" min="0" placeholder="0.00" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Number of days</label>
            <input value={days} onChange={e => setDays(e.target.value)} type="number" min="0" step="0.5" placeholder="1" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Hours per day</label>
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
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
              <div className={rowCls}><span className="text-xs text-zinc-500">Hourly rate</span><span className="text-sm">{fmt(hourly)}/hr</span></div>
              <div className={rowCls}><span className="text-xs text-zinc-500">Day rate</span><span className="text-sm">{fmt(n(dayRate))}/day</span></div>
              {n(days) > 0 && <>
                <div className={rowCls}><span className="text-xs text-zinc-500">Total ({days} days)</span><span className="text-sm">{fmt(totalDayRate)}</span></div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs font-bold text-zinc-300">Inc VAT</span>
                  <span className="text-base font-bold text-green-400">{fmt(totalDayRate * 1.2)}</span>
                </div>
              </>}
            </div>
          )}
        </>}

        {/* MATERIALS */}
        {tab === "materials" && <>
          <p className="text-xs text-zinc-600">Materials + labour = full job price.</p>
          <div>
            <label className={labelCls}>Materials cost (£)</label>
            <input value={matCost} onChange={e => setMatCost(e.target.value)} type="number" min="0" placeholder="0.00" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Materials markup (%)</label>
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
            <label className={labelCls}>Labour (£)</label>
            <input value={labour} onChange={e => setLabour(e.target.value)} type="number" min="0" placeholder="0.00" className={inputCls} />
          </div>
          {(n(matCost) > 0 || n(labour) > 0) && (
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
              <div className={rowCls}><span className="text-xs text-zinc-500">Materials (cost)</span><span className="text-sm">{fmt(n(matCost))}</span></div>
              <div className={rowCls}><span className="text-xs text-zinc-500">Materials (sell +{matMarkup}%)</span><span className="text-sm text-green-400">{fmt(matSell)}</span></div>
              <div className={rowCls}><span className="text-xs text-zinc-500">Mat. profit</span><span className="text-sm text-green-400">+{fmt(matProfit)}</span></div>
              {n(labour) > 0 && <div className={rowCls}><span className="text-xs text-zinc-500">Labour</span><span className="text-sm">{fmt(n(labour))}</span></div>}
              <div className={rowCls}><span className="text-xs font-bold text-zinc-300">Total (ex-VAT)</span><span className="text-sm font-bold">{fmt(jobTotal)}</span></div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs font-bold text-zinc-300">Total (inc-VAT)</span>
                <span className="text-base font-bold text-green-400">{fmt(jobTotal * 1.2)}</span>
              </div>
            </div>
          )}
        </>}

        {/* Save to history button */}
        <button onClick={handleSave}
          className="w-full py-2.5 rounded-xl border border-zinc-700 hover:border-green-500/50 text-zinc-400 hover:text-green-400 text-xs font-medium transition">
          📋 Save to history
        </button>
      </div>
    </div>
  );
}
