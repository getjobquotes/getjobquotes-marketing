"use client";
import { useState, useEffect } from "react";

type Tab = "calc" | "markup" | "vat" | "dayrate" | "materials";

type HistoryEntry = {
  id: string;
  label: string;
  result: string;
  timestamp: number;
};

const HIST_KEY = "gjq_calc_history";
const STATE_KEY = "gjq_calc_state";

const n = (v: string) => parseFloat(v) || 0;
const fmt = (v: number) =>
  `£${v.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const timeAgo = (ts: number) => {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

export default function TradeCalculator({ onClose }: { onClose?: () => void }) {
  const [tab, setTab] = useState<Tab>("calc");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // ── Standard calculator state ──────────────────────────────
  const [display, setDisplay] = useState("0");
  const [stored, setStored] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [justEvaled, setJustEvaled] = useState(false);

  // ── Trade tab state ────────────────────────────────────────
  const [cost, setCost] = useState("");
  const [markup, setMarkup] = useState("20");
  const [vatAmount, setVatAmount] = useState("");
  const [vatMode, setVatMode] = useState<"add" | "remove">("add");
  const [dayRate, setDayRate] = useState("");
  const [days, setDays] = useState("");
  const [hours, setHours] = useState("8");
  const [matCost, setMatCost] = useState("");
  const [matMarkup, setMatMarkup] = useState("30");
  const [labour, setLabour] = useState("");

  // Load persisted state
  useEffect(() => {
    try {
      setHistory(JSON.parse(localStorage.getItem(HIST_KEY) || "[]"));
      const s = JSON.parse(localStorage.getItem(STATE_KEY) || "{}");
      if (s.tab) setTab(s.tab);
      if (s.cost) setCost(s.cost);
      if (s.markup) setMarkup(s.markup);
      if (s.vatAmount) setVatAmount(s.vatAmount);
      if (s.vatMode) setVatMode(s.vatMode);
      if (s.dayRate) setDayRate(s.dayRate);
      if (s.days) setDays(s.days);
      if (s.hours) setHours(s.hours);
      if (s.matCost) setMatCost(s.matCost);
      if (s.matMarkup) setMatMarkup(s.matMarkup);
      if (s.labour) setLabour(s.labour);
    } catch {}
  }, []);

  // Persist state on change
  useEffect(() => {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify({
        tab, cost, markup, vatAmount, vatMode,
        dayRate, days, hours, matCost, matMarkup, labour,
      }));
    } catch {}
  }, [tab, cost, markup, vatAmount, vatMode, dayRate, days, hours, matCost, matMarkup, labour]);

  // ── Standard calc logic ────────────────────────────────────
  const pressDigit = (d: string) => {
    if (justEvaled) { setDisplay(d); setJustEvaled(false); return; }
    setDisplay(prev => prev === "0" ? d : prev.length >= 12 ? prev : prev + d);
  };
  const pressDot = () => {
    if (justEvaled) { setDisplay("0."); setJustEvaled(false); return; }
    if (!display.includes(".")) setDisplay(d => d + ".");
  };
  const pressOp = (op: string) => {
    setStored(parseFloat(display));
    setOperator(op);
    setJustEvaled(true);
  };
  const pressEquals = () => {
    if (stored === null || !operator) return;
    const b = parseFloat(display);
    let r = 0;
    if (operator === "+") r = stored + b;
    else if (operator === "-") r = stored - b;
    else if (operator === "×") r = stored * b;
    else if (operator === "÷") r = b !== 0 ? stored / b : 0;
    const res = parseFloat(r.toFixed(10)).toString();
    setDisplay(res);
    setStored(null);
    setOperator(null);
    setJustEvaled(true);
  };
  const pressClear = () => {
    setDisplay("0");
    setStored(null);
    setOperator(null);
    setJustEvaled(false);
  };
  const pressToggle = () => setDisplay(d => (parseFloat(d) * -1).toString());
  const pressPct = () => setDisplay(d => (parseFloat(d) / 100).toString());
  const pressBack = () => {
    if (display.length <= 1) { setDisplay("0"); return; }
    setDisplay(d => d.slice(0, -1));
  };

  // ── Trade results ──────────────────────────────────────────
  const sellPrice = n(cost) * (1 + n(markup) / 100);
  const markupProfit = sellPrice - n(cost);
  const vatR = vatMode === "add"
    ? { ex: n(vatAmount), vat: n(vatAmount) * 0.2, total: n(vatAmount) * 1.2 }
    : { ex: n(vatAmount) / 1.2, vat: n(vatAmount) - n(vatAmount) / 1.2, total: n(vatAmount) };
  const totalDay = n(dayRate) * n(days);
  const hourly = n(dayRate) / n(hours || "8");
  const matSell = n(matCost) * (1 + n(matMarkup) / 100);
  const jobTotal = matSell + n(labour);

  // ── History ────────────────────────────────────────────────
  const saveToHistory = (label: string, result: string) => {
    const entry: HistoryEntry = { id: Date.now().toString(), label, result, timestamp: Date.now() };
    const updated = [entry, ...history].slice(0, 20);
    setHistory(updated);
    try { localStorage.setItem(HIST_KEY, JSON.stringify(updated)); } catch {}
  };
  const clearHistory = () => {
    setHistory([]);
    try { localStorage.removeItem(HIST_KEY); } catch {}
  };

  // ── Styles ─────────────────────────────────────────────────
  const inp = "w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-green-500 transition";
  const lbl = "text-xs text-zinc-500 mb-1 block";
  const row = "flex justify-between items-center py-2 border-b border-zinc-800 last:border-0";
  const quickBtn = (active: boolean) =>
    `flex-1 py-2 rounded-xl text-xs transition ${active ? "bg-green-600 text-white" : "border border-zinc-700 text-zinc-400 hover:text-white"}`;

  const tabs: { id: Tab; emoji: string; label: string }[] = [
    { id: "calc",      emoji: "🔢", label: "Calc"      },
    { id: "markup",    emoji: "📈", label: "Markup"    },
    { id: "vat",       emoji: "🧾", label: "VAT"       },
    { id: "dayrate",   emoji: "📅", label: "Day Rate"  },
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
            className={`text-xs px-2 py-1 rounded-lg transition ${
              showHistory ? "bg-green-600/20 text-green-400 border border-green-600/30" : "text-zinc-500 hover:text-white border border-zinc-800"
            }`}>
            📋 {history.length > 0 ? history.length : ""}
          </button>
          {onClose && (
            <button onClick={onClose} className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-white text-xl transition">
              ×
            </button>
          )}
        </div>
      </div>

      {/* History */}
      {showHistory && (
        <div className="border-b border-zinc-800 shrink-0 max-h-44 overflow-y-auto bg-zinc-900/60">
          {history.length === 0 ? (
            <p className="text-xs text-zinc-600 text-center py-4">No saved calculations</p>
          ) : (
            <>
              <div className="flex justify-between px-4 py-2">
                <span className="text-xs text-zinc-500 font-medium">History</span>
                <button onClick={clearHistory} className="text-xs text-zinc-700 hover:text-red-400 transition">Clear</button>
              </div>
              {history.map(h => (
                <div key={h.id} className="flex justify-between items-start px-4 py-2 border-t border-zinc-800/50 hover:bg-zinc-900 transition">
                  <div className="min-w-0 mr-2">
                    <p className="text-xs text-zinc-400 truncate">{h.label}</p>
                    <p className="text-xs text-green-400 font-medium">{h.result}</p>
                  </div>
                  <span className="text-xs text-zinc-700 shrink-0">{timeAgo(h.timestamp)}</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 shrink-0 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 min-w-[56px] py-2 text-xs font-medium transition flex flex-col items-center gap-0.5 ${
              tab === t.id
                ? "text-green-400 border-b-2 border-green-500 bg-green-500/5"
                : "text-zinc-500 hover:text-zinc-300"
            }`}>
            <span>{t.emoji}</span>
            <span className="text-[10px]">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">

        {/* ── STANDARD CALCULATOR ─────────────────────────── */}
        {tab === "calc" && (
          <div className="p-3 flex flex-col gap-2">
            {/* Display */}
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 px-5 py-4">
              <p className="text-xs text-zinc-600 h-4 text-right">
                {stored !== null && operator ? `${stored} ${operator}` : ""}
              </p>
              <p className="text-4xl font-bold text-white text-right mt-1 truncate">{display}</p>
            </div>

            {/* Button grid */}
            {[
              [
                { l: "AC",  fn: pressClear,       s: "bg-zinc-700 hover:bg-zinc-600 text-white" },
                { l: "+/-", fn: pressToggle,      s: "bg-zinc-700 hover:bg-zinc-600 text-white" },
                { l: "%",   fn: pressPct,         s: "bg-zinc-700 hover:bg-zinc-600 text-white" },
                { l: "÷",   fn: () => pressOp("÷"), s: "bg-green-600 hover:bg-green-500 text-white" },
              ],
              [
                { l: "7", fn: () => pressDigit("7"), s: "bg-zinc-800 hover:bg-zinc-700 text-white" },
                { l: "8", fn: () => pressDigit("8"), s: "bg-zinc-800 hover:bg-zinc-700 text-white" },
                { l: "9", fn: () => pressDigit("9"), s: "bg-zinc-800 hover:bg-zinc-700 text-white" },
                { l: "×", fn: () => pressOp("×"),    s: "bg-green-600 hover:bg-green-500 text-white" },
              ],
              [
                { l: "4", fn: () => pressDigit("4"), s: "bg-zinc-800 hover:bg-zinc-700 text-white" },
                { l: "5", fn: () => pressDigit("5"), s: "bg-zinc-800 hover:bg-zinc-700 text-white" },
                { l: "6", fn: () => pressDigit("6"), s: "bg-zinc-800 hover:bg-zinc-700 text-white" },
                { l: "-", fn: () => pressOp("-"),     s: "bg-green-600 hover:bg-green-500 text-white" },
              ],
              [
                { l: "1", fn: () => pressDigit("1"), s: "bg-zinc-800 hover:bg-zinc-700 text-white" },
                { l: "2", fn: () => pressDigit("2"), s: "bg-zinc-800 hover:bg-zinc-700 text-white" },
                { l: "3", fn: () => pressDigit("3"), s: "bg-zinc-800 hover:bg-zinc-700 text-white" },
                { l: "+", fn: () => pressOp("+"),     s: "bg-green-600 hover:bg-green-500 text-white" },
              ],
              [
                { l: "⌫", fn: pressBack,            s: "bg-zinc-800 hover:bg-zinc-700 text-zinc-300" },
                { l: "0", fn: () => pressDigit("0"), s: "bg-zinc-800 hover:bg-zinc-700 text-white" },
                { l: ".", fn: pressDot,              s: "bg-zinc-800 hover:bg-zinc-700 text-white" },
                { l: "=", fn: pressEquals,           s: "bg-green-600 hover:bg-green-500 text-white" },
              ],
            ].map((row, ri) => (
              <div key={ri} className="grid grid-cols-4 gap-2">
                {row.map((btn, bi) => (
                  <button key={bi} onClick={btn.fn}
                    className={`${btn.s} rounded-2xl py-4 text-lg font-semibold transition active:scale-95`}>
                    {btn.l}
                  </button>
                ))}
              </div>
            ))}

            {/* Use in trade tabs */}
            {display !== "0" && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button onClick={() => { setCost(display); setTab("markup"); }}
                  className="py-2 rounded-xl border border-zinc-700 text-xs text-zinc-400 hover:text-white hover:border-zinc-500 transition">
                  Use in Markup →
                </button>
                <button onClick={() => { setVatAmount(display); setTab("vat"); }}
                  className="py-2 rounded-xl border border-zinc-700 text-xs text-zinc-400 hover:text-white hover:border-zinc-500 transition">
                  Use in VAT →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── MARKUP ──────────────────────────────────────── */}
        {tab === "markup" && (
          <div className="px-4 py-4 space-y-3">
            <p className="text-xs text-zinc-600">Cost + markup % = sell price.</p>
            <div>
              <label className={lbl}>Your cost (£)</label>
              <input value={cost} onChange={e => setCost(e.target.value)} type="number" min="0" placeholder="0.00" className={inp} />
            </div>
            <div>
              <label className={lbl}>Markup (%)</label>
              <div className="flex gap-2">
                <input value={markup} onChange={e => setMarkup(e.target.value)} type="number" min="0" placeholder="20" className={inp} />
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
                <div className={row}><span className="text-xs text-zinc-500">Cost</span><span className="text-sm">{fmt(n(cost))}</span></div>
                <div className={row}><span className="text-xs text-zinc-500">Profit (+{markup}%)</span><span className="text-sm text-green-400">+{fmt(markupProfit)}</span></div>
                <div className="flex justify-between pt-2">
                  <span className="text-xs font-bold text-zinc-300">Sell price</span>
                  <span className="text-base font-bold text-green-400">{fmt(sellPrice)}</span>
                </div>
              </div>
            )}
            {n(cost) > 0 && (
              <button onClick={() => saveToHistory(`${fmt(n(cost))} + ${markup}%`, `Sell: ${fmt(sellPrice)}`)}
                className="w-full py-2.5 rounded-xl border border-zinc-700 hover:border-green-500/50 text-zinc-400 hover:text-green-400 text-xs transition">
                📋 Save to history
              </button>
            )}
          </div>
        )}

        {/* ── VAT ─────────────────────────────────────────── */}
        {tab === "vat" && (
          <div className="px-4 py-4 space-y-3">
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
              <label className={lbl}>{vatMode === "add" ? "Price ex-VAT (£)" : "Price inc-VAT (£)"}</label>
              <input value={vatAmount} onChange={e => setVatAmount(e.target.value)} type="number" min="0" placeholder="0.00" className={inp} />
            </div>
            {n(vatAmount) > 0 && (
              <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
                <div className={row}><span className="text-xs text-zinc-500">Ex-VAT</span><span className="text-sm">{fmt(vatR.ex)}</span></div>
                <div className={row}><span className="text-xs text-zinc-500">VAT (20%)</span><span className="text-sm text-yellow-400">{fmt(vatR.vat)}</span></div>
                <div className="flex justify-between pt-2">
                  <span className="text-xs font-bold text-zinc-300">Inc-VAT</span>
                  <span className="text-base font-bold text-green-400">{fmt(vatR.total)}</span>
                </div>
              </div>
            )}
            {n(vatAmount) > 0 && (
              <button onClick={() => saveToHistory(`${vatMode === "add" ? "Add" : "Remove"} VAT on ${fmt(n(vatAmount))}`, `Total: ${fmt(vatR.total)}`)}
                className="w-full py-2.5 rounded-xl border border-zinc-700 hover:border-green-500/50 text-zinc-400 hover:text-green-400 text-xs transition">
                📋 Save to history
              </button>
            )}
          </div>
        )}

        {/* ── DAY RATE ────────────────────────────────────── */}
        {tab === "dayrate" && (
          <div className="px-4 py-4 space-y-3">
            <p className="text-xs text-zinc-600">Work out job cost from your day rate.</p>
            <div>
              <label className={lbl}>Day rate (£)</label>
              <input value={dayRate} onChange={e => setDayRate(e.target.value)} type="number" min="0" placeholder="0.00" className={inp} />
            </div>
            <div>
              <label className={lbl}>Number of days</label>
              <input value={days} onChange={e => setDays(e.target.value)} type="number" min="0" step="0.5" placeholder="1" className={inp} />
            </div>
            <div>
              <label className={lbl}>Hours per day</label>
              <div className="flex gap-1">
                {["6","7","8","10"].map(v => (
                  <button key={v} onClick={() => setHours(v)} className={quickBtn(hours === v)}>{v}h</button>
                ))}
              </div>
            </div>
            {n(dayRate) > 0 && (
              <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
                <div className={row}><span className="text-xs text-zinc-500">Hourly</span><span className="text-sm">{fmt(hourly)}/hr</span></div>
                <div className={row}><span className="text-xs text-zinc-500">Per day</span><span className="text-sm">{fmt(n(dayRate))}</span></div>
                {n(days) > 0 && <>
                  <div className={row}><span className="text-xs text-zinc-500">Total ({days}d)</span><span className="text-sm">{fmt(totalDay)}</span></div>
                  <div className="flex justify-between pt-2">
                    <span className="text-xs font-bold text-zinc-300">Inc VAT</span>
                    <span className="text-base font-bold text-green-400">{fmt(totalDay * 1.2)}</span>
                  </div>
                </>}
              </div>
            )}
            {n(dayRate) > 0 && n(days) > 0 && (
              <button onClick={() => saveToHistory(`${fmt(n(dayRate))}/day × ${days}d`, `${fmt(totalDay)} (${fmt(totalDay * 1.2)} inc VAT)`)}
                className="w-full py-2.5 rounded-xl border border-zinc-700 hover:border-green-500/50 text-zinc-400 hover:text-green-400 text-xs transition">
                📋 Save to history
              </button>
            )}
          </div>
        )}

        {/* ── MATERIALS ───────────────────────────────────── */}
        {tab === "materials" && (
          <div className="px-4 py-4 space-y-3">
            <p className="text-xs text-zinc-600">Materials + labour = full job cost.</p>
            <div>
              <label className={lbl}>Materials cost (£)</label>
              <input value={matCost} onChange={e => setMatCost(e.target.value)} type="number" min="0" placeholder="0.00" className={inp} />
            </div>
            <div>
              <label className={lbl}>Materials markup (%)</label>
              <div className="flex gap-1">
                {["15","20","25","30"].map(v => (
                  <button key={v} onClick={() => setMatMarkup(v)} className={quickBtn(matMarkup === v)}>{v}%</button>
                ))}
              </div>
            </div>
            <div>
              <label className={lbl}>Labour (£)</label>
              <input value={labour} onChange={e => setLabour(e.target.value)} type="number" min="0" placeholder="0.00" className={inp} />
            </div>
            {(n(matCost) > 0 || n(labour) > 0) && (
              <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
                <div className={row}><span className="text-xs text-zinc-500">Materials (cost)</span><span className="text-sm">{fmt(n(matCost))}</span></div>
                <div className={row}><span className="text-xs text-zinc-500">Materials (sell)</span><span className="text-sm text-green-400">{fmt(matSell)}</span></div>
                {n(labour) > 0 && <div className={row}><span className="text-xs text-zinc-500">Labour</span><span className="text-sm">{fmt(n(labour))}</span></div>}
                <div className={row}><span className="text-xs font-bold text-zinc-300">Total ex-VAT</span><span className="text-sm font-bold">{fmt(jobTotal)}</span></div>
                <div className="flex justify-between pt-2">
                  <span className="text-xs font-bold text-zinc-300">Total inc-VAT</span>
                  <span className="text-base font-bold text-green-400">{fmt(jobTotal * 1.2)}</span>
                </div>
              </div>
            )}
            {(n(matCost) > 0 || n(labour) > 0) && (
              <button onClick={() => saveToHistory(`Mat ${fmt(n(matCost))} + Labour ${fmt(n(labour))}`, `Job: ${fmt(jobTotal)}`)}
                className="w-full py-2.5 rounded-xl border border-zinc-700 hover:border-green-500/50 text-zinc-400 hover:text-green-400 text-xs transition">
                📋 Save to history
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
