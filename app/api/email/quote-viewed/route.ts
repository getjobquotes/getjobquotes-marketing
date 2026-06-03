import { NextRequest, NextResponse } from "next/server";
import { resend, FROM, APP_URL, emailWrapper, h1, p, btn, divider } from "@/lib/email/sender";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { quoteId, quoteNumber, clientName, userEmail, viewedAt } = await req.json();
    if (!quoteId || !userEmail) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    // Rate limit — only send once per quote per hour
    const cacheKey = `viewed_notified_${quoteId}`;
    const { data: doc } = await supabaseAdmin
      .from("documents")
      .select("last_view_notified")
      .eq("id", quoteId)
      .single();

    if (doc?.last_view_notified) {
      const lastNotified = new Date(doc.last_view_notified).getTime();
      if (Date.now() - lastNotified < 60 * 60 * 1000) {
        return NextResponse.json({ success: true, skipped: "rate_limited" });
      }
    }

    await supabaseAdmin.from("documents").update({ last_view_notified: new Date().toISOString() }).eq("id", quoteId);

    const time = new Date(viewedAt || Date.now()).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    const date = new Date(viewedAt || Date.now()).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

    const html = emailWrapper(`
      ${h1("Quote viewed 👀")}
      ${p(`<strong>${clientName}</strong> just opened your quote at ${time} on ${date}.`)}
      <div style="background:#f4f4f6;border-radius:10px;padding:16px 20px;margin:16px 0;">
        <p style="margin:0;font-size:13px;color:#8a8a93;">Quote <strong style="color:#111114;">${quoteNumber}</strong></p>
        <p style="margin:4px 0 0;font-size:13px;color:#8a8a93;">Client <strong style="color:#111114;">${clientName}</strong></p>
      </div>
      ${p("This is a good time to follow up if you haven't already.")}
      ${btn("View Quote →", `${APP_URL}/dashboard`)}
      ${divider()}
      ${p("You will only receive one of these per hour per quote.", true)}
    `, `${clientName} viewed your quote`);

    await resend.emails.send({
      from: FROM,
      to: userEmail,
      subject: `${clientName} viewed your quote — ${quoteNumber}`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
