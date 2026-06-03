import { NextRequest, NextResponse } from "next/server";
import { resend, FROM, APP_URL, emailWrapper, h1, p, btn, divider } from "@/lib/email/sender";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Called daily by Vercel cron — finds overdue invoices and notifies owners
export async function GET(req: NextRequest) {
  // Verify cron secret
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Get unpaid invoices older than 30 days that haven't had a reminder in 7 days
  const { data: overdueInvoices } = await supabaseAdmin
    .from("documents")
    .select("id, number, client_name, total, user_id, created_at, last_reminder_sent")
    .eq("type", "invoice")
    .eq("status", "pending")
    .lt("created_at", thirtyDaysAgo);

  if (!overdueInvoices?.length) {
    return NextResponse.json({ sent: 0 });
  }

  let sent = 0;
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  for (const invoice of overdueInvoices) {
    // Skip if reminded in last 7 days
    if (invoice.last_reminder_sent && new Date(invoice.last_reminder_sent).getTime() > sevenDaysAgo) continue;

    // Get user email
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("business_email")
      .eq("user_id", invoice.user_id)
      .single();

    if (!profile?.business_email) continue;

    const daysOverdue = Math.floor((Date.now() - new Date(invoice.created_at).getTime()) / (1000 * 60 * 60 * 24));

    const html = emailWrapper(`
      ${h1("Invoice overdue 🔔")}
      ${p(`You have an unpaid invoice that is <strong>${daysOverdue} days old</strong>.`)}
      <table style="width:100%;background:#fef2f2;border-radius:10px;padding:20px;margin:16px 0;border-collapse:collapse;border:1px solid #fecaca;">
        <tr>
          <td style="font-size:13px;color:#8a8a93;padding-bottom:4px;">Invoice</td>
          <td style="font-size:13px;color:#111114;font-weight:700;text-align:right;">${invoice.number}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#8a8a93;padding-bottom:4px;">Client</td>
          <td style="font-size:13px;color:#111114;font-weight:700;text-align:right;">${invoice.client_name}</td>
        </tr>
        <tr>
          <td style="font-size:15px;color:#dc2626;font-weight:700;padding-top:8px;border-top:1px solid #fecaca;">Outstanding</td>
          <td style="font-size:15px;color:#dc2626;font-weight:800;text-align:right;padding-top:8px;border-top:1px solid #fecaca;">${invoice.total ? `£${Number(invoice.total).toFixed(2)}` : "See invoice"}</td>
        </tr>
      </table>
      ${p("Consider following up with your client directly.")}
      ${btn("View Invoice →", `${APP_URL}/dashboard`)}
      ${divider()}
      ${p("You'll receive reminders weekly until the invoice is marked as paid.", true)}
    `, `Unpaid invoice — ${invoice.client_name}`);

    try {
      await resend.emails.send({
        from: FROM,
        to: profile.business_email,
        subject: `Unpaid invoice (${daysOverdue} days) — ${invoice.client_name}`,
        html,
      });

      await supabaseAdmin.from("documents")
        .update({ last_reminder_sent: new Date().toISOString() })
        .eq("id", invoice.id);

      sent++;
    } catch {}
  }

  return NextResponse.json({ sent });
}
