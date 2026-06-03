import { NextRequest, NextResponse } from "next/server";
import { resend, FROM, APP_URL, emailWrapper, h1, p, btn, divider } from "@/lib/email/sender";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await req.json();
    if (!userId || !email) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    // Get profile for name
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("business_name")
      .eq("user_id", userId)
      .single();

    const name = profile?.business_name || "there";

    const html = emailWrapper(`
      ${h1(`Welcome, ${name} 👋`)}
      ${p("You're in. GetJobQuotes is free to use — here's what you can do right now:")}
      <table style="width:100%;margin:16px 0;border-collapse:collapse;">
        ${[
          ["📋", "Create a quote", "Add line items, toggle VAT, download a PDF"],
          ["👥", "Save your clients", "Fill quotes in seconds on repeat jobs"],
          ["🔗", "Share with a link", "Clients accept online — no app needed"],
          ["🧮", "Use the calculator", "VAT, markup and day rates always available"],
        ].map(([icon, title, desc]) => `
          <tr>
            <td style="padding:10px 0;vertical-align:top;width:32px;font-size:18px;">${icon}</td>
            <td style="padding:10px 0 10px 8px;">
              <strong style="color:#111114;font-size:14px;">${title}</strong>
              <br/><span style="color:#8a8a93;font-size:13px;">${desc}</span>
            </td>
          </tr>
        `).join("")}
      </table>
      ${btn("Create your first quote →", `${APP_URL}/tool`)}
      ${divider()}
      ${p("Any questions — reply to this email. We read everything.", true)}
    `, "Your GetJobQuotes account is ready");

    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Welcome to GetJobQuotes 👋",
      html,
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
