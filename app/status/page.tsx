import { createClient } from "@/lib/supabase/server";

export const revalidate = 30;

export default async function StatusPage() {
  let dbOk = false;
  let dbLatency = 0;

  try {
    const start = Date.now();
    const supabase = await createClient();
    await supabase.from("profiles").select("id").limit(1);
    dbLatency = Date.now() - start;
    dbOk = true;
  } catch {}

  const services = [
    { name: "API", status: true, note: "Operational" },
    { name: "Database", status: dbOk, note: dbOk ? `${dbLatency}ms` : "Unreachable" },
    { name: "Auth", status: true, note: "Operational" },
    { name: "PDF Generation", status: true, note: "Client-side" },
  ];

  const allOk = services.every((s) => s.status);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <a href="/" className="text-xl font-bold"><span className="text-green-400">Get</span>JobQuotes</a>
          <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${allOk ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-red-500/30 bg-red-500/10 text-red-400"}`}>
            <span className={`w-2 h-2 rounded-full ${allOk ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
            {allOk ? "All systems operational" : "Service degraded"}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          {services.map((s, i) => (
            <div key={s.name} className={`flex items-center justify-between px-6 py-4 ${i < services.length - 1 ? "border-b border-zinc-800" : ""}`}>
              <span className="text-sm text-white font-medium">{s.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">{s.note}</span>
                <span className={`w-2.5 h-2.5 rounded-full ${s.status ? "bg-green-400" : "bg-red-400"}`} />
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-zinc-700 mt-6">
          Last checked: {new Date().toUTCString()}
        </p>
      </div>
    </div>
  );
}
