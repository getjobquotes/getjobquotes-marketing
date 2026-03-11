import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();
    if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

    const displayName = name || email.split("@")[0];

    const { error } = await resend.emails.send({
      from: "GetJobQuotes <support@getjobquotes.uk>",
      to: email,
      subject: "Welcome to GetJobQuotes 🎉",
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#09090b;color:#fff;border-radius:16px;">
          <h1 style="color:#22c55e;font-size:24px;margin-bottom:8px;">Welcome, ${displayName}!</h1>
          <p style="color:#a1a1aa;font-size:15px;line-height:1.6;">
            Your GetJobQuotes account is ready. Start creating professional quotes and invoices in minutes.
          </p>
          <a href="https://getjobquotes.uk/tool"
            style="display:inline-block;margin-top:24px;padding:12px 28px;background:#16a34a;color:#fff;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">
            Create Your First Quote →
          </a>
          <p style="color:#52525b;font-size:12px;margin-top:32px;">
            GetJobQuotes · <a href="https://getjobquotes.uk" style="color:#52525b;">getjobquotes.uk</a>
          </p>
        </div>
      `,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
