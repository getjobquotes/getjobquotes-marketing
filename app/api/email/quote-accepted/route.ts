import { NextRequest, NextResponse } from "next/server";
import { resend, FROM, APP_URL, emailWrapper, h1, p, btn, divider } from "@/lib/email/sender";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { quoteId, quoteNumber, clientName, total, userEmail } = await req.json();
    if (!quoteId || !userEmail) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const html = emailWrapper(`
      ${h1("Quote accepted ✅")}
      ${p(`Good news — <strong>${clientName}</strong> has accepted your quote.`)}
      <table style="width:100%;background:#f4f4f6;border-radius:10px;padding:20px;margin:16px 0;border-collapse:collapse;">
        <tr>
          <td style="font-size:13px;color:#8a8a93;padding-bottom:4px;">Quote</td>
          <td style="font-size:13px;color:#111114;font-weight:700;text-align:right;">${quoteNumber}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#8a8a93;padding-bottom:4px;">Client</td>
          <td style="font-size:13px;color:#111114;font-weight:700;text-align:right;">${clientName}</td>
        </tr>
        <tr>
          <td style="font-size:15px;color:#111114;font-weight:700;padding-top:8px;border-top:1px solid #e2e2e7;">Total</td>
          <td style="font-size:15px;color:#16a34a;font-weight:800;text-align:right;padding-top:8px;border-top:1px solid #e2e2e7;">${total}</td>
        </tr>
      </table>
      ${p("Convert it to an invoice when you're ready to request payment.")}
      ${btn("Convert to Invoice →", `${APP_URL}/dashboard`)}
      ${divider()}
      ${p("Log in to view the full quote and client details.", true)}
    `, `${clientName} accepted your quote`);

    await resend.emails.send({
      from: FROM,
      to: userEmail,
      subject: `Quote accepted by ${clientName} — ${quoteNumber}`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
