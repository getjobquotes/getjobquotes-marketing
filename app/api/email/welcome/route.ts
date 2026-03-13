import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://getjobquotes.uk").replace(/\/$/, "");

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();
    if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

    // Use first name if available, otherwise friendly fallback
    const firstName = name
      ? name.split(" ")[0].charAt(0).toUpperCase() + name.split(" ")[0].slice(1).toLowerCase()
      : null;
    const greeting = firstName ? `Hello ${firstName}` : "Hello there";

    const { error } = await resend.emails.send({
      from: "GetJobQuotes <hello@getjobquotes.uk>",
      to: email,
      subject: `${greeting} 👋 — you're in!`,
      html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:540px;margin:40px auto;padding:0 16px;">
    <div style="background:#09090b;border:1px solid #27272a;border-radius:24px;overflow:hidden;">

      <!-- Header bar -->
      <div style="background:#16a34a;padding:28px 32px;">
        <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
          GetJobQuotes
        </span>
        <p style="color:#bbf7d0;font-size:13px;margin:4px 0 0;">Professional quotes for UK tradespeople</p>
      </div>

      <!-- Body -->
      <div style="padding:36px 32px;">
        <h1 style="font-size:24px;font-weight:700;color:#ffffff;margin:0 0 12px;line-height:1.3;">
          ${greeting} — welcome aboard! 🎉
        </h1>
        <p style="color:#a1a1aa;font-size:15px;line-height:1.7;margin:0 0 20px;">
          You've just joined a smarter way to quote. No more messing around with spreadsheets,
          PDFs, or chasing clients for a signature.
          <strong style="color:#ffffff;">GetJobQuotes gets it done in under 2 minutes.</strong>
        </p>

        <!-- 3 quick wins -->
        <div style="background:#18181b;border:1px solid #27272a;border-radius:16px;padding:20px 24px;margin-bottom:28px;">
          <p style="color:#71717a;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 16px;">
            Here's what you can do right now
          </p>
          ${[
            ["📋", "Create a quote", "Add your client, line items and notes. Done in minutes."],
            ["📄", "Download the PDF", "Clean, branded, professional. Your logo, your signature."],
            ["📱", "Send it instantly", "Email or WhatsApp a link. Client accepts with one click."],
          ].map(([icon, title, desc]) => `
          <div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:14px;">
            <span style="font-size:20px;flex-shrink:0;">${icon}</span>
            <div>
              <p style="color:#ffffff;font-size:14px;font-weight:600;margin:0 0 2px;">${title}</p>
              <p style="color:#71717a;font-size:13px;margin:0;">${desc}</p>
            </div>
          </div>`).join("")}
        </div>

        <!-- CTA button -->
        <a href="${APP_URL}/tool"
          style="display:block;background:#16a34a;color:#ffffff;text-decoration:none;text-align:center;padding:16px 24px;border-radius:14px;font-weight:700;font-size:15px;margin-bottom:12px;">
          Create Your First Quote →
        </a>
        <a href="${APP_URL}"
          style="display:block;border:1px solid #3f3f46;color:#a1a1aa;text-decoration:none;text-align:center;padding:13px 24px;border-radius:14px;font-size:13px;margin-bottom:24px;">
          Visit getjobquotes.uk
        </a>

        <p style="color:#52525b;font-size:13px;line-height:1.6;margin:0;border-top:1px solid #27272a;padding-top:20px;">
          Any questions? Just reply to this email — we're always here to help.<br/>
          <strong style="color:#71717a;">The GetJobQuotes team</strong>
        </p>
      </div>

    </div>
    <p style="color:#3f3f46;font-size:11px;text-align:center;margin-top:16px;">
      © ${new Date().getFullYear()} GetJobQuotes ·
      <a href="${APP_URL}" style="color:#3f3f46;text-decoration:none;">getjobquotes.uk</a> ·
      <a href="mailto:hello@getjobquotes.uk" style="color:#3f3f46;text-decoration:none;">hello@getjobquotes.uk</a>
    </p>
  </div>
</body>
</html>`,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
