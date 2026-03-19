import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://getjobquotes.uk").replace(/\/$/, "");

const base = (content: string) => `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:520px;margin:40px auto;padding:0 16px;">
    <div style="background:#09090b;border:1px solid #27272a;border-radius:20px;padding:40px 32px;">
      <div style="margin-bottom:28px;">
        <span style="font-size:20px;font-weight:700;color:#fff;">
          <span style="color:#22c55e;">Get</span>JobQuotes
        </span>
      </div>
      ${content}
    </div>
    <p style="color:#3f3f46;font-size:11px;text-align:center;margin-top:20px;">
      GetJobQuotes · getjobquotes.uk · support@getjobquotes.uk
    </p>
  </div>
</body>
</html>`;

const btnStyle = "display:block;background:#16a34a;color:#fff;text-decoration:none;text-align:center;padding:14px 24px;border-radius:12px;font-weight:700;font-size:14px;margin-bottom:16px;";
const noteStyle = "background:#18181b;border:1px solid #3f3f46;border-radius:12px;padding:16px;margin-bottom:20px;";
const noteText = "color:#71717a;font-size:12px;margin:0;";

const templates: Record<string, (data: any) => { subject: string; html: string }> = {
  magic_link: ({ link }) => ({
    subject: "Your GetJobQuotes login link",
    html: base(`
      <h1 style="font-size:22px;font-weight:700;color:#fff;margin:0 0 8px;">Your login link 🔐</h1>
      <p style="color:#a1a1aa;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Click below to log in. This link can only be used once and expires in 1 hour.
      </p>
      <a href="${link}" style="${btnStyle}">Log In to GetJobQuotes</a>
      <div style="${noteStyle}">
        <p style="${noteText}">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `),
  }),

  signup: ({ link }) => ({
    subject: "Confirm your GetJobQuotes account",
    html: base(`
      <h1 style="font-size:22px;font-weight:700;color:#fff;margin:0 0 8px;">Confirm your account ✅</h1>
      <p style="color:#a1a1aa;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Click below to verify your email and activate your account.
      </p>
      <a href="${link}" style="${btnStyle}">Confirm Email Address</a>
      <div style="${noteStyle}">
        <p style="${noteText}">This link expires in 24 hours. If you didn't sign up, ignore this email.</p>
      </div>
    `),
  }),

  reset_password: ({ link }) => ({
    subject: "Reset your GetJobQuotes password",
    html: base(`
      <h1 style="font-size:22px;font-weight:700;color:#fff;margin:0 0 8px;">Reset your password 🔑</h1>
      <p style="color:#a1a1aa;font-size:14px;line-height:1.6;margin:0 0 24px;">
        We received a request to reset your password. Click below to choose a new one.
      </p>
      <a href="${link}" style="${btnStyle}">Reset My Password</a>
      <div style="${noteStyle}">
        <p style="${noteText}">⚠️ This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `),
  }),

  password_changed: ({ email }) => ({
    subject: "Your GetJobQuotes password has been changed",
    html: base(`
      <h1 style="font-size:22px;font-weight:700;color:#fff;margin:0 0 8px;">Password changed ✅</h1>
      <p style="color:#a1a1aa;font-size:14px;line-height:1.6;margin:0 0 24px;">
        The password for <strong style="color:#fff;">${email}</strong> has been updated.
      </p>
      <div style="${noteStyle}">
        <p style="${noteText}">⚠️ If you didn't make this change, contact us immediately at
          <a href="mailto:support@getjobquotes.uk" style="color:#22c55e;">support@getjobquotes.uk</a>
        </p>
      </div>
      <a href="${APP_URL}/dashboard" style="${btnStyle}">Go to Dashboard</a>
    `),
  }),
};

export async function POST(req: NextRequest) {
  try {
    const { type, email, link } = await req.json();

    // Rate limit: 3 auth emails per address per minute
    const { success } = rateLimit(email || "unknown", "auth-email");
    if (!success) {
      return NextResponse.json({ error: "Too many requests. Please wait before requesting another email." }, { status: 429 });
    }
    if (!type || !email) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const template = templates[type];
    if (!template) return NextResponse.json({ error: "Unknown type" }, { status: 400 });

    const { subject, html } = template({ link, email });

    const { error } = await resend.emails.send({
      from: "GetJobQuotes <support@getjobquotes.uk>",
      to: email,
      subject,
      html,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
